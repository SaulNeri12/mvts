# Usa la imagen de Node.js delgada.
FROM node:22.12.0-slim

# Crea y establece el directorio de trabajo.
WORKDIR /usr/src/app

# Copia los archivos de dependencias.
COPY package*.json ./

# Instala las dependencias.
RUN npm install

# Copia todo el código de tu proyecto.
COPY . .

# Expone el puerto que usa tu app.
EXPOSE 3000

# Comando final para correr la aplicación.
CMD [ "node", "./bin/www" ]
