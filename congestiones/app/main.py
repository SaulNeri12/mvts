
# clase main.py

from config.consul import start_consul_connection
from config.rabbitmq import start_rabbit
from app.congestiones_service import start_congestiones_service
from app.semaforos_consumer import init_semaforos_consumer
from app.vehicle_info_loader import inicializar_ubicaciones_semaforos 

import threading

def main():
    # inicializar la data de ubicacion de los semaforos
    inicializar_ubicaciones_semaforos() 
    
    start_rabbit() 
    start_consul_connection()

    print("[*] Congestiones service is running...")


    # iniciar el consumidor de semaforos en un hilo secundario
    semaforos_thread = threading.Thread(
        target=init_semaforos_consumer, 
        name="Consumer-Semaforos-Congestiones", 
        daemon=True
    )
    semaforos_thread.start()
    
    # iniciar el consumidor de posiciones de vehiculos en el hilo principal
    start_congestiones_service() 

if __name__ == "__main__":
    main()