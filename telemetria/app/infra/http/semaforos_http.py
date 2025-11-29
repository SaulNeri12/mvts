from dotenv import load_dotenv
import pybreaker
import requests
import os

load_dotenv()

SEMAFOROS_SERVICE_HOST = os.getenv("SEMAFOROS_SERVICE_HOST", "http://semaforos:3050")

# ------------------------------------------
# Circuit Breaker configurado
# ------------------------------------------
circuit_breaker = pybreaker.CircuitBreaker(
    fail_max=3,
    reset_timeout=5
)

GET_ALL_TIMEOUT = 2

@circuit_breaker
def semaforos_get_all() -> list:
    url = SEMAFOROS_SERVICE_HOST + "/api/v1/semaforos"
    response = requests.get(url, timeout=GET_ALL_TIMEOUT)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"{__file__} Error HTTP: {response.status_code}")
