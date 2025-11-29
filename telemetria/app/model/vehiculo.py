

class Vehiculo():
    """Representa un vehiculo de transporte de material minero en el sistema."""
    def __init__(
        self, 
        codigo: str = "", 
        posicion: dict = None, 
        velocidad: float = 0.0
    ):
        self.codigo = codigo
        self.posicion = posicion or {}
        self.velocidad = velocidad