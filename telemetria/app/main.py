from config.consul import connect_to_consul
from config.rabbitmq import connect_to_rabbitmq

import time

def main():
    # conectarse al service discover (consul)
    connect_to_consul()
    # conectarse al message broker (RabbitMQ)
    connect_to_rabbitmq()
    
    while True:
        print("telemetry service is running...")
        time.sleep(5)
    
if __name__ == "__main__":
    main()