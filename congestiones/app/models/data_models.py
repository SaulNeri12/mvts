#CLASE app/models/data_models.py

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict
import threading

# estructura del mensaje que entra desde telemetria
@dataclass
class PosicionVehiculoData:
    """Representa el mensaje de telemetría de un vehículo (solo posición)."""
    code: str
    latitude: str
    longitude: str
    timestamp: str # Se recibirá como string ISO

# estructura para almacenar el estado temporal del VEHICULO en memoria
@dataclass
class EstadoVehiculoTemp:
    """Almacena el estado reciente para el analisis de congestión."""
    ultima_latitud: float
    ultima_longitud: float
    ultimo_semaforo_estado: str
    timestamp_ultimo_movimiento: datetime 

# estructura para almacenar la data de semáforos "ubicación y estado" 
@dataclass
class SemaforoUbicacion:
    """Representa un semáforo y su ubicación/estado en la memoria local."""
    codigo: str
    latitud: float = 0.0 
    longitud: float = 0.0 
    estado: str = "desconocido"
    timestamp_actualizacion: datetime = field(default_factory=datetime.now)

# estructura del mensaje que manda a ALERTAS y REPORTES
@dataclass
class CongestionAlertaData:
    """Representa la alerta de congestión detectada."""
    id_vehiculo: str
    latitud: float
    longitud: float
    timestamp_inicio: str 
    duracion_segundos: int
    motivo: str = "Detenido tras luz verde"

# Diccionarios y Locks Globales
ESTADOS_VEHICULOS: Dict[str, EstadoVehiculoTemp] = {}
ESTADOS_SEMAFOROS_GLOBALES: Dict[str, SemaforoUbicacion] = {}
SEMAFOROS_LOCK = threading.Lock()