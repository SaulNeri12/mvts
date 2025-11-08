from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit, start_consumer
from messaging.consumers import posiciones_vehiculo

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
    
    # puesta en marcha de consumidores de mensajes
    start_consumer(posiciones_vehiculos_queue, posiciones_vehiculo.callback)

    print("[*] \"Viajes Completados\" service is running...")

    # Simulación de trabajo del servicio
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()