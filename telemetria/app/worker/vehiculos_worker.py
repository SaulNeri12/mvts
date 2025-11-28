import time
from store.vehiculos_store import vehiculos, vehiculos_lock

"""
ESTE NO HACE NADA, PERO SIRVE PARA MOSTRAR QUE LOS DATOS 
PUEDEN ESTAR SEPARADOS DE LOS WORKERS
"""

def vehiculos_loop():
    while True:
        with vehiculos_lock:
            print(f"[WORKER] Vehículos en memoria: {len(vehiculos)}")

        time.sleep(2)