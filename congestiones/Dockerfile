# Imagen base oficial de Python
FROM python:3.12-slim

# Establecer directorio de trabajo en /app (raíz del contenedor)
WORKDIR /app

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código (incluye main.py, .env, y las carpetas app/, config/, etc.)
COPY . /app

# CRUCIAL: Añadir la carpeta de la aplicación ('app') a la ruta de módulos de Python.
# Esto permite que los archivos dentro de 'app' puedan importar entre sí sin usar 'app.'
ENV PYTHONPATH=/app/app:$PYTHONPATH

# Comando de inicio
# Ejecutamos el archivo principal (main.py) que ahora está en la raíz del WORKDIR.
CMD ["python", "-u", "main.py"]
