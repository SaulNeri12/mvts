# conduccion_worker.py (Implementación Completa)

from service import rutas_service
from config.rabbitmq import publish_message
from store.vehiculos_store import vehiculos, vehiculos_lock
from store import semaforos_store

import threading
import time
from datetime import datetime
import json

COLA_POSICIONES_VEHICULOS = "queue.telemetria.vehiculos.posiciones"

VIAJES_COMPLETADOS_QUEUE = "queue.telemetria.vehiculos.viajes.completados"

TIME_STEP = 3 # cada 3 segundos se muven los vehiculos...


def move_vehicle_to_next_point(vehicle):
    """Calcula el siguiente punto en la ruta del vehículo y actualiza sus índices."""
    
    RUTA = rutas_service.RUTA 

    next_point_index = vehicle.current_point_index + 1
    current_segment_index = vehicle.current_segment_index
    
    try:
        current_segment = RUTA[current_segment_index]["tramo"]
    except IndexError:
        return None 
    
    if next_point_index < len(current_segment):
        vehicle.current_point_index = next_point_index
        next_point = current_segment[next_point_index]
        
    else:
        next_segment_index = current_segment_index + 1
        
        if next_segment_index < len(RUTA):
            vehicle.current_segment_index = next_segment_index
            vehicle.current_point_index = 0
            next_point = RUTA[next_segment_index]["tramo"][0]
        else:
            print(f"[WORKER] Vehiculo {vehicle.codigo} completó la ruta.")
            vehicle.is_moving = False
            print(f"Descargando {vehicle.carga} del vehiculo {vehicle.codigo}")
            # TODO: vehiculo se le quita la carga
            carga_recibida = vehicle.carga
            vehicle.carga = {}
            print(f"Carga actual {vehicle.codigo}:  {vehicle.carga}")

            mensaje_viaje = {
                'load': carga_recibida,
                'vehicle': {
                    'code': vehicle.codigo
                },
                'timestamp': datetime.now().isoformat()
            }
            
            publish_message(VIAJES_COMPLETADOS_QUEUE, message=json.dumps(mensaje_viaje))
        
            return None 

    vehicle.posicion = {
        'latitude': next_point["latitude"],
        'longitude': next_point["longitude"],
    }
    return vehicle.posicion


def vehicle_movement_worker(vehicle_code):
    """
    Simula el bucle de movimiento para un solo vehículo (un hilo por vehículo).
    """
    
    while True:
        with vehiculos_lock:
            vehicle = next(
                (v for v in vehiculos if v.codigo == vehicle_code), 
                None
            )
            
            if not vehicle or not vehicle.is_moving:
                time.sleep(TIME_STEP)
                continue

            current_segment_data = rutas_service.RUTA[vehicle.current_segment_index]
            
            semaforo_data = current_segment_data.get("semaforo") 
        
            can_move = True
            if semaforo_data and semaforo_data.get("codigo"):
                codigo_semaforo = semaforo_data["codigo"]
                estado = semaforos_store.obtener_estado(codigo_semaforo)
                if estado:
                    if estado in ["verde", "amarillo"]:
                        can_move = True
                    else:
                        can_move = False
                        print(f"[WORKER] Vehiculo {vehicle_code} detenido. Semáforo {codigo_semaforo} en {estado}")
            if can_move:
                new_position = move_vehicle_to_next_point(vehicle)
                
                if new_position:
                    payload = {
                        'code': vehicle.codigo,
                        'latitude': new_position["latitude"],
                        'longitude': new_position["longitude"],
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    publish_message(COLA_POSICIONES_VEHICULOS, json.dumps(payload))
                
        time.sleep(TIME_STEP)

def conduccion_worker_loop():
    """
    Función principal que lanza un hilo por cada vehículo.
    """
    
    print("[WORKER] Esperando a que se carguen los vehículos...")
    time.sleep(5) 
    
    active_threads = []
    
    with vehiculos_lock:
        for vehicle in vehiculos: 
            codigo = vehicle.codigo 

            thread = threading.Thread(
                target=vehicle_movement_worker, 
                args=(codigo,),
                name=f"Movement-Worker-{codigo}",
                daemon=True
            )
            thread.start()
            active_threads.append(thread)
            print(f"[WORKER] Hilo de movimiento iniciado para Vehiculo: {codigo}")

    while True:
        time.sleep(10)