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
            break

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
    connect_to_rabbitmq()
    threading.Thread(target=keep_connection_alive, daemon=True).start()