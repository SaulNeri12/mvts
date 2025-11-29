from config.consul import start_consul_connection

from config.rabbitmq import (
    connect_to_rabbitmq, 
    publish_message, 
    create_fanout_exchange, 
    create_queue_and_bind
)

from messaging import semaforos_consumer, vehiculos_consumer

from dotenv import load_dotenv
import threading
import time
import os

load_dotenv() 
EXCHANGE_POSICIONES_VEHICULOS = os.getenv("EXCHANGE_POSICIONES_VEHICULOS", "exchange.telemetria.vehiculos.posiciones")
POSICIONES_VEHICULOS_QUEUE  = os.getenv("COLA_POSICIONES_VEHICULOS", "queue.telemetria.vehiculos.posiciones")

ESTADOS_SEMAFOROS_QUEUE    = os.getenv("COLA_ESTADO_SEMAFOROS", "queue.cambio.estados.semaforos")
SEMAFOROS_ESTADO_EXCHANGE = os.getenv("EXCHANGES_SEMAFOROS_ESTADO", "exchange.semaforos.estado")

def init_exchanges_and_queues():
    """
    Configura los Exchanges y Colas usando una conexión temporal.
    """
    print("[*] Configurando RabbitMQ (Exchanges y Colas)...")
    
    conn, channel = connect_to_rabbitmq()
    
    try:
        # creamos los exchanges necesarios para recibir mensajes de otros servicios.
        create_fanout_exchange(channel, EXCHANGE_POSICIONES_VEHICULOS)
        create_fanout_exchange(channel, SEMAFOROS_ESTADO_EXCHANGE)
        
        # definimos las colas a escuchar.
        create_queue_and_bind(channel, ESTADOS_SEMAFOROS_QUEUE, SEMAFOROS_ESTADO_EXCHANGE)
        create_queue_and_bind(channel, POSICIONES_VEHICULOS_QUEUE, EXCHANGE_POSICIONES_VEHICULOS)
        
        print("[*] Configuración inicial de RabbitMQ terminada.")
        
    except Exception as e:
        print(f"[!] Error configurando RabbitMQ: {e}")
    finally:
        if conn and conn.is_open:
            conn.close()

def main():
    # 1. Ejecutar la configuración inicial (Síncrona)
    init_exchanges_and_queues()
    
    # 2. Conectarse a Consul
    start_consul_connection()

    # 3. Lanzar consumidores en hilos separados
    semaforos_thread = threading.Thread(
        target=semaforos_consumer.init, 
        name="Consumer-Semaforos", 
        daemon=True
    )
    
    vehiculos_thread = threading.Thread(
        target=vehiculos_consumer.init, 
        name="Consumer-Vehiculos", 
        daemon=True
    )

    semaforos_thread.start()
    vehiculos_thread.start() 

    print("[*] Telemetry service is running...")

    while True:
        try:
            publish_message(POSICIONES_VEHICULOS_QUEUE, '{"message":"hola mundo"}')
            time.sleep(3)
        except KeyboardInterrupt:
            print("Deteniendo servicio...")
            break

if __name__ == "__main__":
    main()