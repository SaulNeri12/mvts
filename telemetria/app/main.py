from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit, publish_message, create_fanout_exchange, create_queue_and_bind, start_consumer

from service import vehiculos_service
from service import semaforos_service

from messaging import semaforos_consumer

from dotenv import load_dotenv
import time
import os

load_dotenv() # cargar variables de entorno

posiciones_vehiculos_queue  = os.getenv("COLA_POSICIONES_VEHICULOS", "posiciones_vehiculos")
estados_semaforos_queue     = os.getenv("COLA_ESTADO_SEMAFOROS", "cambio_estado_semaforo")
telemetria_service_exchange = os.getenv("EXCHANGE_TELEMETRIA_SERVICE", "telemetria_service")

def main():
    # conectarse al message broker (RabbitMQ)
    start_rabbit()
    # conectarse al service discover (consul)
    start_consul_connection()

    # creamos las colas necesarias
    create_fanout_exchange(telemetria_service_exchange)
    create_queue_and_bind(estados_semaforos_queue, telemetria_service_exchange)
    create_queue_and_bind(posiciones_vehiculos_queue, telemetria_service_exchange)

    # escuchamos los cambios de estado de semaforos
    semaforos_consumer.init()

    print("[*] Telemetry service is running...")

    # Simulación de trabajo del servicio
    while True:
        publish_message(posiciones_vehiculos_queue, '{"message":"hola mundo"}')
        time.sleep(3)

if __name__ == "__main__":
    main()