# clase app/vehicle_info_loader.py

from datetime import datetime
from typing import Optional
from app.models.data_models import ESTADOS_SEMAFOROS_GLOBALES, SemaforoUbicacion, SEMAFOROS_LOCK
import math


SIMULATED_SEMAFORO_DATA = {
    # aqui colocar las coordenadas manualmente de los 2 semaforos
    "S1": {"latitud": "19.4326", "longitud": "-99.1332"},
    "S2": {"latitud": "19.4350", "longitud": "-99.1350"},
}

def inicializar_ubicaciones_semaforos():
    """Inicializa la ubicación de los semáforos usando datos fijos (y los convierte a float)."""
    global ESTADOS_SEMAFOROS_GLOBALES
    with SEMAFOROS_LOCK:
        for codigo, coords in SIMULATED_SEMAFORO_DATA.items():
            try:
                # convertimos a float para que el store interno sea numerico y se puedan hacer los calculos
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
    with SEMAFOROS_LOCK:
        if codigo in ESTADOS_SEMAFOROS_GLOBALES:
            ESTADOS_SEMAFOROS_GLOBALES[codigo].estado = estado
            ESTADOS_SEMAFOROS_GLOBALES[codigo].timestamp_actualizacion = datetime.now()
        else:
            # si se recibe un estado de un semaforo sin ubicación previa, solo lo guardamos
            ESTADOS_SEMAFOROS_GLOBALES[codigo] = SemaforoUbicacion(
                codigo=codigo, 
                estado=estado, 
                timestamp_actualizacion=datetime.now()
            )


def get_semaforo_state(codigo: str) -> str:
    """Obtiene el estado actual de un semáforo."""
    with SEMAFOROS_LOCK:
        # retorna el estado 
        return ESTADOS_SEMAFOROS_GLOBALES.get(codigo, SemaforoUbicacion(codigo=codigo)).estado



# LOGICA PARA DETECTAR EL SEMAFORO MAS CERCANO
    #haversine es una manera de calcular distancia entre 2 puntos usando sus longitudes y latitudes
def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calcula la distancia Haversine entre dos puntos en metros (usando floats)."""
    #aqui si ni idea xd >:v UnU
    R = 6371  # Radio de la Tierra
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c * 1000 # Distancia en metros

def get_closest_semaforo_id(lat: float, lon: float) -> Optional[str]:
    """ Encuentra el código del semáforo más cercano (a menos de 30 metros."""
    min_distance = float('inf')
    closest_semaforo_id = None
    UMBRAL_RELEVANCIA = 30     #se puede cambiar en cualquier momento este valor (es en metros)
    
    with SEMAFOROS_LOCK:
        for codigo, semaforo_info in ESTADOS_SEMAFOROS_GLOBALES.items():
            # solo consideramos semaforos con ubicaciones definidas
            if semaforo_info.latitud != 0 or semaforo_info.longitud != 0:
                distancia = haversine_distance(lat, lon, semaforo_info.latitud, semaforo_info.longitud)
                
                if distancia < min_distance:
                    min_distance = distancia
                    closest_semaforo_id = codigo

    if closest_semaforo_id and min_distance < UMBRAL_RELEVANCIA: 
        return closest_semaforo_id
    
    return None