from infra.http.semaforos_http import semaforos_get_all

import pybreaker
import requests

def get_all() -> list:
    """Obtiene todos los semaforos alojados en el servicio de semaforos."""
    try:
        semaforos = semaforos_get_all()
        print(semaforos)
        return semaforos
    except pybreaker.CircuitBreakerError:
        print(f"[x] {__file__} Circuito ABIERTO: no se realizará la solicitud.")
    except requests.exceptions.Timeout:
        print(f"[x] {__file__} Timeout: el servicio de semaforos tardó demasiado en responder.")
    except Exception as e:
        print(f"[x] {__file__} Error general: {e}")