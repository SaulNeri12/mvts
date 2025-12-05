import time
import json
from datetime import datetime
from rabbit_publisher import publish_message, COLA_POSICIONES, EXCHANGE_SEMAFOROS

# --- DATOS DEL ESCENARIO DE PRUEBAAAA ---
VEHICULO_ID = "VH-01"

# coordenadas estaticas de semaforo S1 (para la logica de congestiones)
LAT_SEMAFORO_S1 = "30.97278024833265"
LON_SEMAFORO_S1 = "-110.3504071944602"
SEMAFORO_ID_S1 = "247498" 

# el servicio de congestiones espera una detencion de 9 segundos
TIEMPO_DETENIDO_NECESARIO = 11 

# --- MENSAJES SIMULADOS ---

def enviar_estado_semaforo(sem_id, estado):
    """Envía el mensaje de cambio de estado de semáforo."""
    mensaje = {
        "id": sem_id,
        "estado": estado,
        "ts": int(time.time() * 1000)
    }
    publish_message(EXCHANGE_SEMAFOROS, "", mensaje)

def enviar_posicion_vehiculo(lat, lon):
    """Envía un mensaje de posición de vehículo."""
    mensaje = {
        "code": VEHICULO_ID,
        "latitude": str(lat),
        "longitude": str(lon),
        "timestamp": datetime.now().isoformat()
    }
    publish_message("", COLA_POSICIONES, mensaje)

# --- ESCENARIO PRINCIPAL ---

def simular_congestion():
    
    # PAUSA INICIAL: Esperamos 5 segundos para asegurarnos que Telemetría ha iniciado
    print("\n[PAUSA] Esperando 5 segundos para que los servicios se estabilicen...")
    time.sleep(5)
    
    print("\n" + "="*50)
    print(f"| INICIANDO SIMULACIÓN DE CONGESTIÓN para {VEHICULO_ID} |")
    print("="*50 + "\n")

    print("--- 1. INICIO: Inicializando estado del vehículo y semáforo (ROJO) ---")
    enviar_estado_semaforo(SEMAFORO_ID_S1, "rojo")
    enviar_posicion_vehiculo(LAT_SEMAFORO_S1, LON_SEMAFORO_S1) # Posición A

    time.sleep(2) 

    # 2. el semaforo cambia a VERDE
    print("\n--- 2. EVENTO CLAVE: Semáforo S1 cambia a VERDE ---")
    enviar_estado_semaforo(SEMAFORO_ID_S1, "verde")

    # 3. el vehiculo reporta su posicion, pero NO SE MUEVE (Detención Inesperada)
    print("--- 3. DETENCIÓN: Vehículo VH-01 reporta primera posición estática ---")
    enviar_posicion_vehiculo(LAT_SEMAFORO_S1, LON_SEMAFORO_S1) 
    
    # 4. esperamos el tiempo de umbral (TIEMPO_DETENIDO_NECESARIO)
    tiempo_espera = TIEMPO_DETENIDO_NECESARIO
    print(f"\n--- 4. ESPERANDO {tiempo_espera}s... (El vehículo NO se mueve, a pesar del VERDE) ---")
    
    for _ in range(int(tiempo_espera / 2)): 
         time.sleep(2)
         enviar_posicion_vehiculo(LAT_SEMAFORO_S1, LON_SEMAFORO_S1) # Sigue en Posición A
         
    # 5. Reporte final que DEBE activar la congestion
    print("\n--- 5. VERIFICACIÓN: Enviando posición para activar la alerta ---")
    enviar_posicion_vehiculo(LAT_SEMAFORO_S1, LON_SEMAFORO_S1) 
    
    print("\n--- ¡SIMULACIÓN TERMINADA! ---")
    
if __name__ == "__main__":
    import json
    simular_congestion()

    #PARA EJECUTAR LA PRUEBA: docker run --rm -v "$(Get-Location)/pruebas:/pruebas" --network mvts_mvts_network -e "RABBITMQ_HOST=rabbitmq" -e "RABBITMQ_PORT=5672" python:3.11-slim sh -c "pip install pika && python /pruebas/simulador_prueba.py"