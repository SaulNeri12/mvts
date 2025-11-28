from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit, publish_message, create_fanout_exchange, create_queue_and_bind

from service import vehiculos_service

from dotenv import load_dotenv
import time
import os

load_dotenv() # cargar variables de entorno

posiciones_vehiculos_queue  = os.getenv("COLA_POSICIONES_VEHICULOS", "posiciones_vehiculos")
telemetria_service_exchange = os.getenv("EXCHANGE_TELEMETRIA_SERVICE", "telemetria_service")

def main():
    # conectarse al message broker (RabbitMQ)
    start_rabbit()
    # conectarse al service discover (consul)
    start_consul_connection()

    # creamos las colas necesarias
    create_fanout_exchange(telemetria_service_exchange)
    create_queue_and_bind(posiciones_vehiculos_queue, telemetria_service_exchange)

    print("[*] Telemetry service is running...")

    #vehiculos_service.get_all()

    # Simulación de trabajo del servicio
    while True:
        publish_message(posiciones_vehiculos_queue, '{"message":"hola mundo"}')
        time.sleep(3)

if __name__ == "__main__":
    main()