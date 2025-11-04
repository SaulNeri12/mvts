from config.consul import start_consul_connection
from config.rabbitmq import connect_to_rabbitmq, keep_connection_alive
import time
import threading

def main():
    # conectarse al service discover (consul)
    start_consul_connection()

    # conectarse al message broker (RabbitMQ)
    connection, channel = connect_to_rabbitmq()  # cambiar tu función para que devuelva connection y channel

    # Hilo para mantener viva la conexión de RabbitMQ
    threading.Thread(target=keep_connection_alive, args=(connection,), daemon=True).start()

    # Simulación de trabajo del servicio
    while True:
        print("telemetry service is running...")
        time.sleep(5)

if __name__ == "__main__":
    main()