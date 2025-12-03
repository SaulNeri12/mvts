from config.rabbitmq import start_consumer

from service import vehiculos_service, rutas_service

from store import vehiculos_store
from model.vehiculo import Vehiculo

from dotenv import load_dotenv
import json
import os

load_dotenv() 

#estados_semaforos_queue     = os.getenv("COLA_ESTADO_SEMAFOROS", "cambio_estado_semaforo")

def init():
    RUTA = rutas_service.get_ruta() 
    
    vehiculos = vehiculos_service.get_all()
    for v in vehiculos:
        veh_memory = Vehiculo(
            codigo=v["code"], 
            current_segment_index=0, 
            current_point_index=0,
            carga=v["load"]
        )
        
        try:
            initial_point = RUTA[0]["tramo"][0]
            veh_memory.posicion = {
                'latitude': initial_point["latitude"],
                'longitude': initial_point["longitude"]
            }
        except IndexError:
            print("[!] Advertencia: RUTA está vacía o mal formada. No se asignó posición inicial.")
            
        vehiculos_store.agregar_vehiculo(veh_memory)
        
    print(vehiculos_store.obtener_todos())


"""
def cb_estados_vehiculos_consumer(ch, method, properties, body):
    mensaje = body.decode('utf-8')
    
    try:
        data_semaforo = json.loads(mensaje)
    except json.JSONDecodeError as e:
        print(f" [!] ERROR al decodificar JSON: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag)
        return
    
    codigo = data_semaforo.get('id')
    estado = data_semaforo.get('estado')
    
    semaforos_store.actualizar_estado(codigo, estado)
    
    # NOTE: SOLO PARA DEBUGGING
    print(semaforos_store.obtener_todos())
    
    ch.basic_ack(delivery_tag=method.delivery_tag)
"""