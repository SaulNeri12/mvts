from infra.http.vehiculos_http import vehiculos_get_all

import pybreaker
import requests

def get_all() -> list:
    """Obtiene todos los vehiculos ACTIVOS alojados en el servicio de vehiculos."""
    try:
        vehiculos = vehiculos_get_all()
        print(vehiculos)
        return vehiculos
    except pybreaker.CircuitBreakerError:
        print(f"[x] {__file__} Circuito ABIERTO: no se realizará la solicitud.")
    except requests.exceptions.Timeout:
        print(f"[x] {__file__} Timeout: el servicio de vehiculos tardó demasiado en responder.")
    except Exception as e:
        print(f"[x] {__file__} Error general: {e}")