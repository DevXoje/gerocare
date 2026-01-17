# Dockerfile para entorno de desarrollo
FROM node:20.19.0

# Instalar Firebase Tools globalmente
RUN npm install -g firebase-tools

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Exponer puertos
# 5173: Vite dev server
# 8080: Firestore emulator
# 9099: Auth emulator
# 4000: Firebase UI
EXPOSE 5173 8080 9099 4000

# Comando por defecto (puede ser sobrescrito en docker-compose)
CMD ["npm", "run", "dev:emulators"]
