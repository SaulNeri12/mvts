from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit
import time

def main():
    # conectarse al message broker (RabbitMQ)
    start_rabbit()
    # conectarse al service discover (consul)
    start_consul_connection()

    print("[*] Telemetry service is running...")

    # Simulación de trabajo del servicio
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()