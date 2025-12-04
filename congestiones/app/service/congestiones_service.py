# clase app/congestiones_service.py

import json
from datetime import datetime
from typing import Dict, Optional
from dataclasses import asdict
from os import getenv

# CORRECCIÓN: Importamos directamente desde el nombre del paquete (config, models, etc.)
from config.rabbitmq import start_consumer, publish_to_exchange 
from models.data_models import PosicionVehiculoData, EstadoVehiculoTemp, CongestionAlertaData, ESTADOS_VEHICULOS
from vehicle_info_loader import get_semaforo_state, get_closest_semaforo_id

COLA_POSICIONES_VEHICULOS = getenv("COLA_POSICIONES_VEHICULOS", "posiciones_vehiculos")
EXCHANGE_CONGESTIONES = getenv("COLA_CONGESTIONES", "congestiones") 

# INDICAMOS EL UMBRAL DE MOVIMIENTO Y EL TIEMPO MAXIMO DETENIDO PARA DETERMINAR CONGESTION
UMBRAL_MOVIMIENTO = 0.00001 
TIEMPO_MAXIMO_DETENIDO = 15 #segundos


def analizar_posicion(vehiculo_id: str, lat: float, lon: float, timestamp: str) -> Optional[CongestionAlertaData]:
    """ Detecta congestión: vehículo detenido > 15s después de semáforo en 'verde'."""
    # recibe lat/lon ya convertidos a float

   # parsear tiempo actual
    try:
        current_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    except ValueError:
        print(f"[ERROR] Timestamp inválido para {vehiculo_id}")
        return None

    # encontrar el semaforo relevante y su estado
    semaforo_relevante_id = get_closest_semaforo_id(lat, lon)
    
    if not semaforo_relevante_id:
        return None # si no hay semaforo cercano, no aplica la logica
    
    current_semaforo_estado = get_semaforo_state(semaforo_relevante_id)

    # obtener el estado previo o inicializarlo
    estado_previo = ESTADOS_VEHICULOS.get(vehiculo_id)

    if not estado_previo:
        # inicializacion del estado: esto guarda la posicion y el estado actual del semaforo
        ESTADOS_VEHICULOS[vehiculo_id] = EstadoVehiculoTemp(
            ultima_latitud=lat, 
            ultima_longitud=lon, 
            ultimo_semaforo_estado=current_semaforo_estado, 
            timestamp_ultimo_movimiento=current_time 
        )
        return None

    # lgica de detección
    se_movio = (abs(lat - estado_previo.ultima_latitud) > UMBRAL_MOVIMIENTO or
                abs(lon - estado_previo.ultima_longitud) > UMBRAL_MOVIMIENTO)

    if se_movio:
        # el vehiculo se movio: actualizar el estado y resetear el temporizador de detencion
        ESTADOS_VEHICULOS[vehiculo_id] = EstadoVehiculoTemp(
            ultima_latitud=lat, 
            ultima_longitud=lon, 
            ultimo_semaforo_estado=current_semaforo_estado, 
            timestamp_ultimo_movimiento=current_time
        )
        return None
    
    # si NO se movio: verificar si la condicion de congestion se cumple
    
    # condicion de activacion: el semaforo estaba en VERDE en la ultima actualizacion
    estuvo_en_verde = estado_previo.ultimo_semaforo_estado.lower() == 'verde'

    if estuvo_en_verde:
        tiempo_detenido = (current_time - estado_previo.timestamp_ultimo_movimiento).total_seconds()
        
        if tiempo_detenido >= TIEMPO_MAXIMO_DETENIDO:
            # !!!! DETECTA CONGESTIONN !!!!!
            print(f"!!! CONGESTIÓN DETECTADA en {vehiculo_id} !!! Tiempo detenido: {tiempo_detenido:.2f}s")

            alerta = CongestionAlertaData(
                id_vehiculo=vehiculo_id,
                latitud=lat, 
                longitud=lon, 
                timestamp_inicio=estado_previo.timestamp_ultimo_movimiento.isoformat(),
                duracion_segundos=int(tiempo_detenido)
            )

            # borrar el estado temporal para esa congestion
            del ESTADOS_VEHICULOS[vehiculo_id] 
            print(f"[!] Estado de {vehiculo_id} borrado. Nuevo ciclo.")
            
            return alerta
    
    # Si no se movio y no hubo congestion, actualizamos el estado del semaforo en el registro
    ESTADOS_VEHICULOS[vehiculo_id].ultimo_semaforo_estado = current_semaforo_estado
    
    return None



def callback_posiciones(ch, method, properties, body):
    """ Callback al recibir un mensaje de posición de vehículo."""
    try:
        message = json.loads(body)
        
        # deserializar a PosicionVehiculoData (con strings)
        posicion_data = PosicionVehiculoData(
            code=message['code'],
            latitude=message['latitude'],
            longitude=message['longitude'],
            timestamp=message['timestamp'],
        )
        
        # CONVERSION STRINGS a FLOAT para la logica de analisis
        vehiculo_id = posicion_data.code
        lat_float = float(posicion_data.latitude)
        lon_float = float(posicion_data.longitude)
        timestamp_str = posicion_data.timestamp
        
        # llamar a la funcion de analisis con los floats
        alerta = analizar_posicion(vehiculo_id, lat_float, lon_float, timestamp_str)
       
        if alerta:
            mensaje_alerta = json.dumps(asdict(alerta))
            # publicar al exchange para que lo consuman Alertas y Reportes
            publish_to_exchange(EXCHANGE_CONGESTIONES, mensaje_alerta)
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except json.JSONDecodeError:
        print(f"[ERROR] Mensaje JSON inválido recibido: {body}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
    except ValueError:
        print(f"[ERROR] Error de conversión: latitud/longitud deben ser números. Datos: {body}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"[ERROR] Procesando mensaje en Congestiones: {e}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=True)


def start_congestiones_service():
    """Inicia el consumidor de RabbitMQ para las posiciones de vehículos (hilo principal)."""
    print(f"[*] Congestiones Service: Iniciando consumidor para la cola '{COLA_POSICIONES_VEHICULOS}'...")
    start_consumer(COLA_POSICIONES_VEHICULOS, callback_posiciones)