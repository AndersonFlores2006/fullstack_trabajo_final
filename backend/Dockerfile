FROM node:18-alpine

WORKDIR /app

# Copiar los archivos de dependencias
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY backend/ .

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 
