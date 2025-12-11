#CLASE app/models/data_models.py

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict
import threading

# --- Estructura del mensaje entrante desde Telemetria (Posición) ---
@dataclass
class PosicionVehiculoData:
    code: str
    latitude: str
    longitude: str
    timestamp: str 

# --- Estructura para almacenar el estado temporal del VEHÍCULO en memoria ---
@dataclass
class EstadoVehiculoTemp:
    """Almacena el estado reciente para el análisis de detención."""
    ultima_latitud: float
    ultima_longitud: float
    timestamp_ultimo_movimiento: datetime 
    
    ultimo_semaforo_estado: str = "N/A" 

# ya no es relevante, pero se mantiene para evitar errores
@dataclass
class SemaforoUbicacion:
    """Representa un semáforo (Ahora solo almacena ID para compatibilidad si es necesario)."""
    codigo: str
    latitud: float = 0.0 
    longitud: float = 0.0 
    estado: str = "N/A"
    timestamp_actualizacion: datetime = field(default_factory=datetime.now)

# --- Estructura del mensaje saliente hacia Alertas y Reportes ---
@dataclass
class CongestionAlertaData:
    id_vehiculo: str
    latitud: float
    longitud: float
    timestamp_inicio: str 
    duracion_segundos: int
    motivo: str = "Detenido críticamente por 24 segundos."

# Diccionarios y Locks Globales
ESTADOS_VEHICULOS: Dict[str, EstadoVehiculoTemp] = {}
ESTADOS_SEMAFOROS_GLOBALES: Dict[str, SemaforoUbicacion] = {}
SEMAFOROS_LOCK = threading.Lock()