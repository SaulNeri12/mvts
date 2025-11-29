from model.vehiculo import Vehiculo

from typing import Optional
import threading

vehiculos = []
vehiculos_lock = threading.Lock()

def obtener_todos():
    with vehiculos_lock:
        return vehiculos

def agregar_vehiculo(vehiculo: Vehiculo):
    """Agrega un nuevo vehiculo al sistema para localizarlo en tiempo real.

    Args:
        vehiculo (Vehiculo): Vehiculo a agregar.
    """
    with vehiculos_lock:
        vehiculos_tmp = vehiculos
        for v in vehiculos_tmp:
            if v.codigo == vehiculo.codigo:
                return
        # si no existe dentro, lo agrega...
        vehiculos.append(vehiculo)
    
def eliminar_vehiculo(codigo: str) -> Optional[Vehiculo]:
    """Elimina un vehiculo del tracker de vehiculos.

    Args:
        codigo (str): Codigo identificador del vehiculo.
    Returns:
        Optional[Vehiculo]: Vehiculo eliminado (para uso posterior)
    """
    with vehiculos_lock:
        for i, v in enumerate(vehiculos):
            if v.codigo == codigo:
                vehiculo_eliminado = vehiculos.pop(i)
                return vehiculo_eliminado
        
        return None


def actualizar_posicion(posicion: dict) -> None:
    """
    Actualiza la posicion actual de un vehiculo en el sistema.
    Args:
        posicion (dict): Posicion GPS actual del vehiculo.
    """
    codigo_a_actualizar = posicion.get('codigo')
    
    if not codigo_a_actualizar:
        return

    with vehiculos_lock:
        for v in vehiculos:
            if v.codigo == codigo_a_actualizar:
                v.posicion = posicion
                return
