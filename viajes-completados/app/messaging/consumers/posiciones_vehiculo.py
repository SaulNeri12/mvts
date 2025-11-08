

def callback(channel, method, properties, body):
    """
    Maneja los mensajes de las posiciones de los vehiculos provenientes del
    servicio de telemetría
    """
    mensaje = body.decode("utf-8")
    print(f"[m] Mensaje recibido: {mensaje}")