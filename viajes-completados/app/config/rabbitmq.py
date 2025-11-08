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

def create_queue(queue_name: str):
    global channel

    try:
        if not channel or channel.is_closed:
            raise Exception("[x] Channel no inicializado. Llama primero a connect().")

        channel.queue_declare(queue=queue_name, durable=True)
        print(f"[*] Cola creada: {queue_name}")
    except Exception as e:
        print(f"[*] Error creando la cola '{queue_name}': {e}")

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

def start_consumer(queue_name, callback):
    global connection, channel
    while True:
        try:
            channel.queue_declare(queue=queue_name, durable=True)

            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=True
            )

            print(f"[!] Consumidor escuchando {queue_name}")
            channel.start_consuming()

        except Exception as e:
            print(f"[!] Consumidor caído: {e}")
            time.sleep(3)

def connect_to_rabbitmq():
    """Intenta conectar a RabbitMQ hasta lograrlo"""
    global connection, channel
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)

    while True:
        try:
            print(f"[RABBITMQ] Intentando conectar a {RABBITMQ_HOST}:{RABBITMQ_PORT}")
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=credentials,
                    heartbeat=30,
                    blocked_connection_timeout=90
                )
            )
            channel = connection.channel()
            print("[RABBITMQ] [*] Conexión exitosa")
            return connection, channel
        except Exception as e:
            print(f"[RABBITMQ] [x] Error de conexión: {e}")
            print("[RABBITMQ] ⏳ Reintentando en 5 segundos...")
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