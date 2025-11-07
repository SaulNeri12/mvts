from dotenv import load_dotenv
import threading
import socket
import atexit
import time
import consul
import os

# carga el archivo de variables de entorno
load_dotenv()

# Variables de entorno
CONSUL_HOST = os.getenv("CONSUL_HOST", "consul-server")
CONSUL_PORT = int(os.getenv("CONSUL_PORT", "8500"))
SERVICE_NAME = os.getenv("SERVICE_NAME", "viajes-completados-service")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "3008"))

SERVICE_ID = f"{SERVICE_NAME}-{SERVICE_PORT}"

TTL_INTERVAL = int(os.getenv("TTL_INTERVAL", "10"))

# Conexión al servidor Consul
consul_client = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)

def register_service():
    """
    Registra el servicio en Consul con un check TTL
    """
    service_address = socket.gethostbyname(socket.gethostname())

    consul_client.agent.service.register(
        name=SERVICE_NAME,
        service_id=SERVICE_ID,
        address=service_address,
        port=SERVICE_PORT,
        check={
            "TTL": f"{TTL_INTERVAL * 2}s",  
            "DeregisterCriticalServiceAfter": "1m"
        }
    )
    
    print(f"Servicio registrado en Consul: {SERVICE_ID}")
    
    # Se asegura de deregistrar al cerrar
    atexit.register(lambda: consul_client.agent.service.deregister(SERVICE_ID))

def send_heartbeat(interval_secs: int = 10):
    check_id = f"service:{SERVICE_ID}"

    def heartbeat_loop():
        while True:
            try:
                consul_client.agent.check.ttl_pass(check_id)
                print(f"Heartbeat enviado -> {check_id}")
            except Exception as e:
                print(f"Error enviando heartbeat: {e}")
            time.sleep(interval_secs)

    threading.Thread(target=heartbeat_loop, daemon=True).start()

def start_consul_connection():
    """
    Se encarga de registrar y arrancar el heartbeat en un hilo separado
    """
    register_service()
    send_heartbeat(interval_secs=10)
    print("Heartbeats iniciados en hilo separado")