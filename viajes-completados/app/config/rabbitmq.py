import pika
import os
import time
import threading

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")
POSICIONES_VEHICULOS_QUEUE = os.getenv("COLA_POSICIONES_VEHICULOS", "posiciones_queue")

MAX_RETRIES = 15
RETRY_DELAY = 3  # Segundos

def connect_to_rabbitmq():
    retries = MAX_RETRIES
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)

    while retries > 0:
        try:
            print(f"[RABBITMQ] Intentando conectar a {RABBITMQ_HOST}:{RABBITMQ_PORT} - Reintentos restantes: {retries}")

            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=credentials,
                    heartbeat=30,
                    blocked_connection_timeout=300
                )
            )

            channel = connection.channel()
            channel.queue_declare(queue=POSICIONES_VEHICULOS_QUEUE)
            print(f"[RABBITMQ] ✅ Conexión exitosa")
            return connection, channel

        except Exception as e:
            print(f"[RABBITMQ] ❌ Error conectando: {e}")
            retries -= 1
            time.sleep(RETRY_DELAY)

    raise Exception("[RABBITMQ] ❌ No se pudo conectar después de varios intentos")

def keep_connection_alive(conn):
    while True:
        try:
            conn.process_data_events(time_limit=1)
        except pika.exceptions.ConnectionClosed:
            print("[RABBITMQ] Conexión cerrada. Intentando reconectar...")
            reconnect(conn)
            break
        except Exception as e:
            print(f"[RABBITMQ] Error en keep-alive: {e}")
        time.sleep(1)

def reconnect(old_conn):
    while True:
        try:
            new_conn, _ = connect_to_rabbitmq()
            keep_connection_alive(new_conn)
            print("[RABBITMQ] Reconexión exitosa")
            break
        except Exception as e:
            print(f"[RABBITMQ] Error reconectando: {e}")
            time.sleep(5)
