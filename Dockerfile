# Dockerfile para entorno de desarrollo
FROM node:20.19.0

# Instalar Java 21 (requerido para Firebase Emulators - mínimo versión 21)
# Usar Temurin (Eclipse Adoptium) ya que openjdk-21 no está en repositorios de Bookworm
# Instalar curl para healthchecks
RUN apt-get update && apt-get install -y wget curl && \
    wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | apt-key add - && \
    echo "deb https://packages.adoptium.net/artifactory/deb bookworm main" | tee /etc/apt/sources.list.d/adoptium.list && \
    apt-get update && apt-get install -y temurin-21-jdk && \
    rm -rf /var/lib/apt/lists/*

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
# 6006: Storybook
# 8080: Firestore emulator
# 9099: Auth emulator
# 4000: Firebase UI
EXPOSE 5173 6006 8080 9099 4000

# Nota: No hay CMD por defecto - cada servicio define su comando en docker-compose.yml
