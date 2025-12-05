# clase app/semaforos_consumer.py

import json
from os import getenv
from app.config.rabbitmq import start_consumer, create_fanout_exchange, connect_to_rabbitmq 
from app.vehicle_info_loader import update_semaforo_state 

# variables del .env
EXCHANGE_SEMAFOROS_ESTADO = getenv("EXCHANGES_SEMAFOROS_ESTADO", "exchange.semaforos.estado")
COLA_SEMAFOROS_CONGESTIONES = getenv("COLA_SEMAFOROS_CONGESTIONES", "queue.congestiones.semaforos") 


def callback_semaforos(ch, method, properties, body):
    """
    Callback para manejar los cambios de estado de semáforos.
    Espera el formato exacto: { "id": "...", "estado": "..." }
    """
    try:
        
        message = json.loads(body)
        
        code = message.get('id')       
        state = message.get('estado')   
        
        if not code or not state:
            # Si falta una clave, lanzamos un error claro
            raise ValueError("Mensaje incompleto. Falta 'id' o 'estado'.")
            
        
        update_semaforo_state(
            codigo=code, 
            estado=state 
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except json.JSONDecodeError:
        print(f"[ERROR] Mensaje de semáforo JSON inválido. Body: {body.decode()}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False) 
    except Exception as e:
        # capturamos errores de logica (ValueError)
        print(f"[ERROR CRÍTICO SEMÁFORO] {e}. Mensaje fallido: {body.decode()}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False) 


def init_semaforos_consumer():
    """
    Configura la cola y el enlace, e inicia el consumidor de semáforos en modo bloqueante.
    """
    conn, channel = connect_to_rabbitmq(is_consumer=True)
    try:
        create_fanout_exchange(channel, EXCHANGE_SEMAFOROS_ESTADO)
        channel.queue_declare(queue=COLA_SEMAFOROS_CONGESTIONES, durable=True)
        channel.queue_bind(exchange=EXCHANGE_SEMAFOROS_ESTADO, queue=COLA_SEMAFOROS_CONGESTIONES, routing_key="") 
        
        start_consumer(COLA_SEMAFOROS_CONGESTIONES, callback_semaforos)
        
    except Exception as e:
        print(f"[ERROR] Fallo al configurar e iniciar consumidor de semáforos: {e}")
    finally:
        if conn and conn.is_open:
            conn.close()