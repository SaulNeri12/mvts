from dotenv import load_dotenv
import threading
import atexit
import socket
import consul
import time
import os

# carga el archivo de variables de entorno
load_dotenv()

CONSUL_HOST = os.getenv("CONSUL_HOST")
CONSUL_PORT = int(os.getenv("CONSUL_PORT"))
SERVICE_NAME = os.getenv("SERVICE_NAME")
SERVICE_PORT = int(os.getenv("SERVICE_PORT"))
SERVICE_ID = f"{SERVICE_NAME}-{SERVICE_PORT}"

consul_client = consul.Consul(host=CONSUL_HOST, port=CONSUL_PORT)

# registrar el servicio en Consul
def register_service(consul_client):
    host = socket.gethostname()
    container_host=socket.gethostbyname(host)
    
    consul_client.agent.service.register(
        name=SERVICE_NAME,
        service_id=SERVICE_ID,
        port=SERVICE_PORT,
        address=SERVICE_NAME,
        check={"TTL": "15s"}
    )

# envia su estado al servidor de consul
def send_heartbeat_to_consul(interval_secs: int = 10):
    def heartbeat_loop():
        while True:
            try:
                consul_client.agent.check.pass_service(check_id=SERVICE_ID)
                # print(f"Heartbeat enviado a Consul para {SERVICE_ID}")
            except Exception as e:
                print(f"Error enviando heartbeat: {e}")
            time.sleep(interval_secs)

    threading.Thread(target=heartbeat_loop, daemon=True).start()

# se conecta o intenta reconectar a consul
def connect_to_consul():
    created = False
    while not created:
        try:
            register_service(consul_client)
            print(f"Service '{SERVICE_NAME}' registered on port {SERVICE_PORT}.")
            atexit.register(lambda: consul_client.agent.service.deregister(SERVICE_ID))
            created = True
            break
        except Exception as e:
            print(f"Error registering service: {e}")
        time.sleep(10)  # Re-register every 10 seconds
    # despues de que se conecto...
    send_heartbeat_to_consul()
