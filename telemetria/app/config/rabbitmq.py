import pika
import os
import time
import threading

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")

connection = None
channel = None

def create_fanout_exchange(channel: pika.channel.Channel, exchange_name: str) -> None:
    """
    Crea un exchange tipo fanout usando el canal proporcionado.

    Args:
        channel: El objeto de canal de Pika.
        exchange_name: Nombre del exchange.
    """
    channel.exchange_declare(exchange=exchange_name, exchange_type='fanout', durable=True)
    print(f"[*] Exchange fanout creado: {exchange_name}")


def create_queue_and_bind(channel: pika.channel.Channel, queue_name: str, exchange_name: str) -> None:
    """
    Crea una cola y la enlaza al exchange fanout, usando el canal proporcionado.

    Args:
        channel: El objeto de canal de Pika.
        queue_name: Nombre de la cola.
        exchange_name: Nombre del exchange al que enlazar.
    """
    channel.queue_declare(queue=queue_name, durable=True)
    channel.queue_bind(exchange=exchange_name, queue=queue_name)
    print(f"[*] Cola '{queue_name}' enlazada a exchange '{exchange_name}'")

def publish_message_to_all(exchange_name, message):
    global channel
    try:
        channel.basic_publish(
            exchange=exchange_name,
            routing_key="",
            body=message
        )
        print(f"[*] Mensaje broadcast desde '{exchange_name}': {message}")
    except Exception as e:
        print(f"[!] Error enviando broadcast: {e}")
        
"""
def publish_message(queue_name, message, exchange=""):
    global connection, channel
    for attempt in range(5):
        try:
            if not channel or channel.is_closed:
                connection, channel = connect_to_rabbitmq()

            channel.basic_publish(
                exchange=exchange,
                routing_key=queue_name,
                body=message
            )
            print(f"[*] Mensaje enviado a {queue_name}: {message}")
            return
        except Exception as e:
            print(f"[!] Error al enviar mensaje (intento {attempt+1}/5): {e}")
            time.sleep(2)

    print("[!] No se pudo enviar el mensaje tras varios intentos.")
"""


def publish_message(queue_name, message, exchange=""):
    local_connection = None
    local_channel = None
    for attempt in range(5):
        try:
            local_connection, local_channel = connect_to_rabbitmq(is_consumer=True)
            
            local_channel.basic_publish(
                exchange=exchange,
                routing_key=queue_name,
                body=message.encode('utf-8') if isinstance(message, str) else message,
                properties=pika.BasicProperties(delivery_mode=2)
            )
            print(f"[*] Mensaje enviado a {queue_name}: {message}")
            return
        except Exception as e:
            print(f"[!] Consumidor caído: {e}")
            time.sleep(3)
        finally:
            if local_connection and local_connection.is_open:
                local_connection.close()


def publish_to_exchange(exchange_name, message, routing_key=""):
    local_connection = None
    local_channel = None
    
    body = message.encode('utf-8') if isinstance(message, str) else message

    for attempt in range(5):
        try:
            local_connection, local_channel = connect_to_rabbitmq(is_consumer=True) 
            
            local_channel.basic_publish(
                exchange=exchange_name,
                routing_key=routing_key, 
                body=body,
                properties=pika.BasicProperties(delivery_mode=2) 
            )
            print(f"[*] Mensaje enviado al Exchange '{exchange_name}' (Routing Key: '{routing_key}')")
            return

        except Exception as e:
            print(f"[!] Error al publicar al Exchange (intento {attempt+1}/5): {e}")
            time.sleep(2)
            
        finally:
            if local_connection and local_connection.is_open:
                local_connection.close()

    print(f"[!] No se pudo publicar el mensaje tras {5} intentos.")


def start_consumer(queue_name, callback):
    #global connection, channel
    while True:
        try:
            conn, channel = connect_to_rabbitmq(is_consumer=True)
            
            channel.queue_declare(queue=queue_name, durable=True)

            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=False
            )

            print(f"[!] Consumidor escuchando {queue_name}")
            channel.start_consuming()

        except Exception as e:
            print(f"[!] Consumidor caído: {e}")
            time.sleep(3)
        finally:
            if conn and conn.is_open:
                try:
                    conn.close()
                except Exception:
                    pass

def connect_to_rabbitmq(is_consumer=False):
    """Intenta conectar a RabbitMQ hasta lograrlo"""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)

    while True:
        try:
            print(f"[RABBITMQ] Intentando conectar a {RABBITMQ_HOST}:{RABBITMQ_PORT}")
            new_connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=credentials,
                    heartbeat=30,
                    blocked_connection_timeout=90
                )
            )
            new_channel = new_connection.channel()
            
            if not is_consumer:
                global connection, channel
                connection = new_connection
                channel = new_channel
            
            print("[RABBITMQ] [*] Conexión exitosa")
            return new_connection, new_channel
        except Exception as e:
            print(f"[RABBITMQ] [x] Error de conexión: {e}")
            print("[RABBITMQ] Reintentando en 5 segundos...")
            time.sleep(5)

def keep_connection_alive():
    """Mantiene vivo el heartbeat mientras la conexión esté abierta"""
    while True:
        try:
            if connection and connection.is_open:
                connection.process_data_events(time_limit=1)
        except Exception:
            print("[!] Conexión perdida. Reintentando conexión...")
            connect_to_rabbitmq()
        time.sleep(1)

def start_rabbit():
    connection, channel = connect_to_rabbitmq()