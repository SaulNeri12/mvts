import time
import json
from datetime import datetime
from rabbit_publisher import publish_message, COLA_POSICIONES

# --- DATOS DEL ESCENARIO DE PRUEBA ---
# ¡USAMOS UN CÓDIGO DE VEHÍCULO QUE NO ESTÁ EN MOVIMIENTO!
VEHICULO_ID = "TEST-01" 

# Coordenadas estáticas (Coordenadas ficticias lejanas para evitar conflicto)
LAT_PRUEBA = "20.00000000000000"
LON_PRUEBA = "-100.0000000000000"

# La nueva regla es 24 segundos. Usaremos 25s para garantizar la detección.
TIEMPO_DETENIDO_NECESARIO = 25 
REPORTE_INTERVALO = 5 

# --- MENSAJES SIMULADOS ---

def enviar_posicion_vehiculo(lat, lon):
    """Envía un mensaje de posición de vehículo."""
    mensaje = {
        "code": VEHICULO_ID, # <-- Usamos TEST-01
        "latitude": str(lat),
        "longitude": str(lon),
        "timestamp": datetime.now().isoformat()
    }
    publish_message("", COLA_POSICIONES, mensaje)

# --- ESCENARIO PRINCIPAL ---

def simular_congestion():
    
    print("\n" + "="*50)
    print(f"| INICIANDO SIMULACIÓN DE CONGESTIÓN CRÍTICA para {VEHICULO_ID} |")
    print(f"| Condición: Detenido por > {TIEMPO_DETENIDO_NECESARIO}s |")
    print("="*50 + "\n")

    # 1. Movimiento inicial (para inicializar el estado del vehículo)
    print(f"--- 1. INICIO: Inicializando estado del vehículo en {LAT_PRUEBA} ---")
    enviar_posicion_vehiculo(LAT_PRUEBA, LON_PRUEBA) # Posición A

    # 2. Esperamos el tiempo de umbral (TIEMPO_DETENIDO_NECESARIO)
    tiempo_espera = TIEMPO_DETENIDO_NECESARIO
    print(f"\n--- 2. ESPERANDO {tiempo_espera}s... (El vehículo NO se mueve) ---")
    
    num_reportes = int(tiempo_espera / REPORTE_INTERVALO)
    for _ in range(num_reportes): 
         time.sleep(REPORTE_INTERVALO)
         enviar_posicion_vehiculo(LAT_PRUEBA, LON_PRUEBA) # Sigue en Posición A
         
    # 3. Reporte final que DEBE activar la congestión
    print("\n--- 3. VERIFICACIÓN: Enviando posición para activar la alerta ---")
    time.sleep(REPORTE_INTERVALO / 2)
    enviar_posicion_vehiculo(LAT_PRUEBA, LON_PRUEBA) # Sigue en Posición A
    
    print("\n--- ¡SIMULACIÓN TERMINADA! ---")
    
if __name__ == "__main__":
    import json
    simular_congestion()