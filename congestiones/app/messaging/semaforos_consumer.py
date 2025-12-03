# clase app/semaforos_consumer.py

import json
from os import getenv
from config.rabbitmq import start_consumer, create_fanout_exchange, connect_to_rabbitmq 
from app.vehicle_info_loader import update_semaforo_state 

EXCHANGE_SEMAFOROS_ESTADO = getenv("EXCHANGES_SEMAFOROS_ESTADO", "exchange.semaforos.estado")
COLA_SEMAFOROS_CONGESTIONES = getenv("COLA_SEMAFOROS_CONGESTIONES", "queue.congestiones.semaforos") 


def callback_semaforos(ch, method, properties, body):
    """Callback para manejar los cambios de estado de semáforos.
    El mensaje esperado es: { "codigo": "(codigo)", "estado": "(estado)" }
    """
    try:
        message = json.loads(body)
        
        # esto llama a la función de almacenamiento global para actualizar el estado
        update_semaforo_state(
            codigo=message['codigo'],
            estado=message['estado']
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        print(f"[ERROR] Mensaje de semáforo JSON inválido: {body}")
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"[ERROR] Procesando mensaje de semáforo: {e}")
        # Reencolamos si no es un error de formato, por si es un error temporal
        ch.basic_reject(delivery_tag=method.delivery_tag, requeue=True)


def init_semaforos_consumer():
    """ Configura la cola y el enlace, e inicia el consumidor de semáforos en modo bloqueante."""
    conn, channel = connect_to_rabbitmq(is_consumer=True)
    try:
        # creamos el exchange si no existe
        create_fanout_exchange(channel, EXCHANGE_SEMAFOROS_ESTADO)

        # declaramos la cola privada del servicio de CONGESTIONES
        channel.queue_declare(queue=COLA_SEMAFOROS_CONGESTIONES, durable=True)

        # enlazamos la cola al exchange
        channel.queue_bind(exchange=EXCHANGE_SEMAFOROS_ESTADO, queue=COLA_SEMAFOROS_CONGESTIONES, routing_key="") 
        
        # inicia el consumidor (bloquea el hilo)
        start_consumer(COLA_SEMAFOROS_CONGESTIONES, callback_semaforos)
        
    except Exception as e:
        print(f"[ERROR] Fallo al configurar e iniciar consumidor de semáforos: {e}")
    finally:
        if conn and conn.is_open:
            conn.close()