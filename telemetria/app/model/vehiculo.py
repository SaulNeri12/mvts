

class Vehiculo():
    """Representa un vehiculo de transporte de material minero en el sistema."""
    def __init__(
        self, 
        codigo: str = "", 
        posicion: dict = None, 
        velocidad: float = 0.0,
        current_segment_index: int = 0, # Índice del tramo principal en RUTA
        current_point_index: int = 0,   # Índice del punto dentro del tramo
        is_moving: bool = True,
        carga: dict = {}
    ):
        self.codigo = codigo
        self.posicion = posicion or {}
        self.velocidad = velocidad
        self.current_segment_index = current_segment_index
        self.current_point_index = current_point_index
        self.is_moving = is_moving,
        self.carga = carga or {}
    
    def __repr__(self):
        return f"Vehiculo(codigo='{self.codigo}', posicion='{self.posicion}')"

    def __str__(self):
        # Para usuarios: Representación amigable.
        return f"Vehiculo(codigo='{self.codigo}', posicion='{self.posicion}')"