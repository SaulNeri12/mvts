
from model.semaforo import Semaforo

from typing import Optional
import threading

semaforos = []
semaforos_lock = threading.Lock()

def obtener_todos():
    with semaforos_lock:
        return semaforos

def agregar_semaforo(semaforo: Semaforo) -> None:
    with semaforos_lock:
        for s in semaforos:
            if s.codigo == semaforo.codigo:
                return
        
        semaforos.append(semaforo)

def eliminar_semaforo(codigo: str) -> Optional[Semaforo]:
    with semaforos_lock:
        for i, s in enumerate(semaforos):
            if s.codigo == codigo:
                semaforo_eliminado = semaforos.pop(i)
                return semaforo_eliminado
        
        return None

def actualizar_estado(codigo: str, nuevo_estado: str) -> bool:
    if not isinstance(nuevo_estado, str):
        return False

    with semaforos_lock:
        for s in semaforos:
            if s.codigo == codigo:
                s.estado = nuevo_estado
                return True
        
        return False

def obtener_estado(codigo: str) -> str:
    with semaforos_lock:
        for s in semaforos:
            if s.codigo == codigo:
                return s.estado
        
        return None