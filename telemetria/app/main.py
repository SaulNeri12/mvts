from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit, publish_message, create_queue

from dotenv import load_dotenv
import time
import os

load_dotenv() # cargar variables de entorno

posiciones_vehiculos_queue = os.getenv("COLA_POSICIONES_VEHICULOS", "posiciones_vehiculos")

def main():
    # conectarse al message broker (RabbitMQ)
    start_rabbit()
    # conectarse al service discover (consul)
    start_consul_connection()

    # creamos las colas necesarias
    create_queue(posiciones_vehiculos_queue)

    print("[*] Telemetry service is running...")

    # Simulación de trabajo del servicio
    while True:
        publish_message(posiciones_vehiculos_queue, "{\"message\":\"hola mundo\"}")
        time.sleep(3)

if __name__ == "__main__":
    main()