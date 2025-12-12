# clase app/congestiones_service.py

import json
from datetime import datetime
from typing import Dict, Optional
from dataclasses import asdict
from os import getenv

from app.config.rabbitmq import start_consumer, publish_to_exchange
from app.models.data_models import PosicionVehiculoData, EstadoVehiculoTemp, CongestionAlertaData, ESTADOS_VEHICULOS 

# Colas y Exchanges (del .env)
COLA_POSICIONES_VEHICULOS = getenv("COLA_POSICIONES_VEHICULOS", "queue.telemetria.vehiculos.posiciones")
EXCHANGE_CONGESTIONES = getenv("COLA_CONGESTIONES", "exchange.vehiculos.congestiones")

UMBRAL_MOVIMIENTO = 0.000001 
TIEMPO_MAXIMO_DETENIDO = 24 

def analizar_posicion(vehiculo_id: str, lat: float, lon: float, timestamp: str) -> Optional[CongestionAlertaData]:
    """
    Detecta congestión: vehículo detenido por más de 24 segundos.
    """
    
    try:
        current_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    except ValueError:
        print(f"[ERROR] Timestamp inválido para {vehiculo_id}")
        return None

    estado_previo = ESTADOS_VEHICULOS.get(vehiculo_id)

    if not estado_previo:
        # Inicialización
        ESTADOS_VEHICULOS[vehiculo_id] = EstadoVehiculoTemp(
            ultima_latitud=lat, 
            ultima_longitud=lon, 
            timestamp_ultimo_movimiento=current_time, 
            ultimo_semaforo_estado="N/A"
        )
        return None

    se_movio = (abs(lat - estado_previo.ultima_latitud) > UMBRAL_MOVIMIENTO or
                abs(lon - estado_previo.ultima_longitud) > UMBRAL_MOVIMIENTO)
    
    if se_movio:
       
        ESTADOS_VEHICULOS[vehiculo_id] = EstadoVehiculoTemp(
            ultima_latitud=lat, 
            ultima_longitud=lon, 
            timestamp_ultimo_movimiento=current_time,
            ultimo_semaforo_estado="N/A"
        )
        return None
    
   
    tiempo_detenido = (current_time - estado_previo.timestamp_ultimo_movimiento).total_seconds()
    
    print(f"TIEMPO DETENIDO: {tiempo_detenido}")
    
    if tiempo_detenido >= TIEMPO_MAXIMO_DETENIDO:
        # ¡CONGESTIÓN DETECTADA!
        print(f"!!! CONGESTIÓN DETECTADA en {vehiculo_id} !!! Tiempo detenido: {tiempo_detenido:.2f}s")
        
        # Publicacion de alerta y limpieza
        alerta = CongestionAlertaData(
            id_vehiculo=vehiculo_id,
            latitud=lat, 
            longitud=lon, 
            timestamp_inicio=estado_previo.timestamp_ultimo_movimiento.isoformat(),
            duracion_segundos=int(tiempo_detenido),
            motivo="Detenido críticamente por 24 segundos."
        )

        del ESTADOS_VEHICULOS[vehiculo_id] 
        print(f"[!] Estado de {vehiculo_id} borrado. Nuevo ciclo.")
        
        return alerta
    
    # Si no se movió y no ha pasado el tiempo crítico, no hacemos nada.
    return None


def callback_posiciones(ch, method, properties, body):
    try:
        message = json.loads(body)
        
        posicion_data = PosicionVehiculoData(
            code=message['code'],
            latitude=message['latitude'],
            longitude=message['longitude'],
            timestamp=message['timestamp'],
        )
        
        vehiculo_id = posicion_data.code
        lat_float = float(posicion_data.latitude)
        lon_float = float(posicion_data.longitude)
        timestamp_str = posicion_data.timestamp
        
        alerta = analizar_posicion(vehiculo_id, lat_float, lon_float, timestamp_str)
        
        print(f"ALERTA: {alerta}")
        
        if alerta:
            mensaje_alerta = json.dumps(asdict(alerta))
            print(f"[ALERTA PUBLICADA] {mensaje_alerta}")
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