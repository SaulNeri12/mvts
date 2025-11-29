

class Semaforo():
    def __init__(self, codigo, estado):
        self.codigo = codigo
        self.estado = estado
        
    def __repr__(self):
        return f"Semaforo(codigo='{self.codigo}', estado='{self.estado}')"

    def __str__(self):
        # Para usuarios: Representación amigable.
        return f"Semaforo {self.codigo} está en estado: {self.estado}"