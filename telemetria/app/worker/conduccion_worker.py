
from service import vehiculos_service, semaforos_service, ruta_service

import time

from store.vehiculos_store import vehiculos, vehiculos_lock

def conduccion_loop():
    
    
    
    while True:
        with vehiculos_lock:
            print(f"[WORKER] Vehículos en memoria: {len(vehiculos)}")

        time.sleep(2)