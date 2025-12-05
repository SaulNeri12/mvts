# clase app/vehicle_info_loader.py

from datetime import datetime
from typing import Optional
from app.models.data_models import ESTADOS_SEMAFOROS_GLOBALES, SemaforoUbicacion, SEMAFOROS_LOCK
import threading
import math
import os


SIMULATED_SEMAFORO_DATA = {
    # Semaforo 1 (S1 en la documentacion interna)
    "247498": {"latitud": "30.97278024833265", "longitud": "-110.3504071944602"},
    # Semaforo 2 (S2 en la documentacion interna)
    "123456": {"latitud": "30.9692866660163", "longitud": "-110.355977576714"},
}


def inicializar_ubicaciones_semaforos():
    """Inicializa la ubicación de los semáforos usando datos fijos (y los convierte a float)."""
    global ESTADOS_SEMAFOROS_GLOBALES
    with SEMAFOROS_LOCK:
        for codigo, coords in SIMULATED_SEMAFORO_DATA.items():
            try:
                # Convertimos a float para que el store interno sea numerico
                lat_float = float(coords["latitud"])
                lon_float = float(coords["longitud"])
                ESTADOS_SEMAFOROS_GLOBALES[codigo] = SemaforoUbicacion(
                    codigo=codigo, 
                    latitud=lat_float, 
                    longitud=lon_float
                )
            except ValueError:
                print(f"[ERROR] Las coordenadas del semáforo {codigo} no son números válidos.")

    print(f"[LOADER] Inicializados {len(ESTADOS_SEMAFOROS_GLOBALES)} semáforos fijos (Ubicaciones de referencia).")


def update_semaforo_state(codigo: str, estado: str):
    """ Actualiza el estado de un semáforo en la memoria global. """
    from datetime import datetime
    with SEMAFOROS_LOCK:
        # busca por el codigo real (ej: "247498")
        if codigo in ESTADOS_SEMAFOROS_GLOBALES:
            ESTADOS_SEMAFOROS_GLOBALES[codigo].estado = estado
            ESTADOS_SEMAFOROS_GLOBALES[codigo].timestamp_actualizacion = datetime.now()
        else:
            # bi el codigo es desconocido, lo agrega con ubicacion 0,0
            ESTADOS_SEMAFOROS_GLOBALES[codigo] = SemaforoUbicacion(
                codigo=codigo, 
                estado=estado, 
                timestamp_actualizacion=datetime.now()
            )


def get_semaforo_state(codigo: str) -> str:
    """Obtiene el estado actual de un semáforo."""
    with SEMAFOROS_LOCK:
        # devuelve el estado, o "desconocido" si no existe la clave
        return ESTADOS_SEMAFOROS_GLOBALES.get(codigo, SemaforoUbicacion(codigo=codigo)).estado



# este es un calculo Haversine que sirve para medir distancias entre 2 puntos con long y lat.
    #la verdad ni idea aqui xd >:v UnU
def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calcula la distancia Haversine entre dos puntos en metros (usando floats)."""
    R = 6371 
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c * 1000 

def get_closest_semaforo_id(lat: float, lon: float) -> Optional[str]:
    """ Encuentra el código del semáforo más cercano (a menos de 100 metros)."""
    min_distance = float('inf')
    closest_semaforo_id = None
    UMBRAL_RELEVANCIA = 100 
    
    with SEMAFOROS_LOCK:
        for codigo, semaforo_info in ESTADOS_SEMAFOROS_GLOBALES.items():
            if semaforo_info.latitud != 0.0 or semaforo_info.longitud != 0.0:
                distancia = haversine_distance(lat, lon, semaforo_info.latitud, semaforo_info.longitud)
                
                if distancia < min_distance:
                    min_distance = distancia
                    closest_semaforo_id = codigo

    if closest_semaforo_id and min_distance < UMBRAL_RELEVANCIA: 
        current_state = get_semaforo_state(closest_semaforo_id)
        print(f"[DEBUG LOADER] Semáforo {closest_semaforo_id} detectado a {min_distance:.6f}m. Estado actual: {current_state}")
        return closest_semaforo_id
    
    return None