

class Vehiculo():
    """Representa un vehiculo de transporte de material minero en el sistema."""
    def __init__(
        self, 
        codigo: str = "", 
        ubicacion: dict = None, 
        velocidad: float = 0.0, 
        ubicacion_anterior: dict = None
    ):
        self.codigo = codigo
        self.ubicacion = ubicacion or {}
        self.velocidad = velocidad
        self.ubicacion_anterior = ubicacion_anterior or {}