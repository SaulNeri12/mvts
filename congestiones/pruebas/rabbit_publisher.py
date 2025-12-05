import json
import pika
import os
import time

#ualmente.

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672")) 
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")

def connect_to_rabbitmq():
    """Establece y retorna una nueva conexión y canal a RabbitMQ."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=credentials
            )
        )
        channel = connection.channel()
        return connection, channel
    except Exception as e:
        print(f"[ERROR RABBIT] No se pudo conectar a RabbitMQ en {RABBITMQ_HOST}:{RABBITMQ_PORT}. Error: {e}")
        return None, None

def publish_message(exchange_name, routing_key, message):
    """
    Publica un mensaje a un exchange o directamente a una cola.
    Abre y cierra la conexión para cada publicación (transient publisher).
    """
    connection, channel = connect_to_rabbitmq()
    if not connection:
        return

    try:
        # aseguramos que los exchanges existen si estamos publicando a un exchange
        if exchange_name:
             channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
             
        body = json.dumps(message).encode('utf-8')

        channel.basic_publish(
            exchange=exchange_name,
            routing_key=routing_key,
            body=body,
            properties=pika.BasicProperties(
                delivery_mode=2, # hace el mensaje persistente
                content_type='application/json'
            )
        )
        print(f"[PUBLICADO] -> Exchange:'{exchange_name}' / Routing:'{routing_key}'. Mensaje: {message}")
        
    except Exception as e:
        print(f"[ERROR PUBLICACION] Fallo al publicar el mensaje: {e}")
    finally:
        if connection.is_open:
            connection.close()

# colas y exchanges a donde vamos a publicar:
COLA_POSICIONES = "queue.telemetria.vehiculos.posiciones"
EXCHANGE_SEMAFOROS = "exchange.semaforos.estado"