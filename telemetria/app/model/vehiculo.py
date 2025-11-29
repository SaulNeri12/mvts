

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
    
    def __repr__(self):
        return f"Vehiculo(codigo='{self.codigo}', posicion='{self.posicion}')"

    def __str__(self):
        # Para usuarios: Representación amigable.
        return f"Vehiculo(codigo='{self.codigo}', posicion='{self.posicion}')"