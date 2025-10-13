# aqui ira la configuracion de Pika (rabbitmq)
from dotenv import load_dotenv
import threading
import atexit
import socket
import time
import pika
import os

load_dotenv()

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = os.getenv("RABBITMQ_PORT", "5672")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")
POSICIONES_VEHICULOS_QUEUE = os.getenv("COLA_POSICIONES_VEHICULOS", "posiciones_queue")

channel = None

def connect_to_rabbitmq():
    global channel
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST, 
            credentials=credentials,
            heartbeat=30,  # heartbeat cada 30s
            blocked_connection_timeout=300  # tiempo máximo de espera si la conexión se bloquea
        )
    )
    print(f"[RABBITMQ] Connected to RabbitMQ: {RABBITMQ_HOST}:{RABBITMQ_PORT}")
    channel = connection.channel()
    
def initialize_queues():
    # cola para enviar las posiciones de los vehiculos...
    channel.queue_declare(queue=POSICIONES_VEHICULOS_QUEUE)
    # demas colas...