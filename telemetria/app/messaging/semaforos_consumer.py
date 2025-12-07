from config.rabbitmq import start_consumer

from service import semaforos_service
from store import semaforos_store
from model.semaforo import Semaforo

from dotenv import load_dotenv
import json
import os

load_dotenv() 

ESTADOS_SEMAFOROS_EXCHANGE    = os.getenv("EXCHANGE_SEMAFOROS_ESTADOS", "exchange.semaforos.estado")

def init():
    semaforos = semaforos_service.get_all()
    for sem in semaforos:
        memory_sem = Semaforo(sem["code"], "none")
        semaforos_store.agregar_semaforo(memory_sem)
    print(f"[rabbitMQ] consumiento eventos de: {ESTADOS_SEMAFOROS_EXCHANGE}")
    
    start_consumer(
        callback=cb_estados_semaforos_consumer, 
        queue_name=None,
        exchange_name=ESTADOS_SEMAFOROS_EXCHANGE,
        routing_key=''
    )

def cb_estados_semaforos_consumer(ch, method, properties, body):
    """
    Recibe los cambios de estado constantes.
    """
    mensaje = body.decode('utf-8')
    
    #print(f"#### MENSAJE: {mensaje}")
    
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