# Desarrollo con Docker

Esta guía explica cómo usar Docker para el desarrollo de GeroCare sin necesidad de instalar Node.js, npm o Firebase Tools localmente.

## Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado y funcionando
- [Docker Compose](https://docs.docker.com/compose/install/) (incluido en Docker Desktop)

Verifica la instalación:

```bash
docker --version
docker-compose --version
```

## Inicio Rápido

```bash
# Construir e iniciar el entorno de desarrollo
docker-compose up --build

# O simplemente iniciar (si ya está construido)
docker-compose up
```

Una vez iniciado, accede a:
- **Aplicación Vue**: http://localhost:5173
- **Firebase UI**: http://localhost:4000
- **Firestore Emulator**: http://localhost:8080
- **Auth Emulator**: http://localhost:9099

## Comandos Comunes

### Iniciar el Entorno

```bash
# Iniciar en primer plano (ver logs)
docker-compose up

# Iniciar en segundo plano (detached)
docker-compose up -d

# Construir e iniciar (útil después de cambios en Dockerfile)
docker-compose up --build
```

### Detener el Entorno

```bash
# Detener contenedores (mantiene volúmenes y datos)
docker-compose down

# Detener y eliminar volúmenes (borra datos de Firebase emulators)
docker-compose down -v
```

### Ver Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f app

# Ver últimas 100 líneas
docker-compose logs --tail=100
```

### Ejecutar Comandos en el Contenedor

```bash
# Ejecutar comandos npm
docker-compose exec app npm run lint
docker-compose exec app npm run test:unit
docker-compose exec app npm run build
docker-compose exec app npm run type-check

# Abrir shell interactivo
docker-compose exec app sh
# o
docker-compose exec app bash
```

### Reconstruir la Imagen

```bash
# Reconstruir sin cache (útil después de cambios en Dockerfile)
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up --build
```

## Arquitectura

### Servicios

El proyecto usa un único servicio `app` que ejecuta:
- **Vite Dev Server**: Servidor de desarrollo de Vue
- **Firebase Emulators**: Auth y Firestore emulators

### Puertos

| Puerto | Servicio | Descripción |
|-------|----------|-------------|
| 5173 | Vite | Servidor de desarrollo frontend |
| 8080 | Firestore | Emulador de Firestore |
| 9099 | Auth | Emulador de Autenticación |
| 4000 | Firebase UI | Interfaz web de Firebase Emulators |

### Volúmenes

1. **Código Fuente** (`.:/app`): Monta el proyecto completo para hot-reload
2. **Node Modules** (`/app/node_modules`): Volumen anónimo para evitar conflictos entre host y contenedor
3. **Firestore Data** (`firestore-data:/app/firestore_export`): Volumen persistente para datos de emulators

## Hot Reload

El hot-reload funciona automáticamente gracias al montaje del código fuente como volumen. Los cambios en archivos `.vue`, `.ts`, `.css`, etc. se reflejan inmediatamente sin necesidad de reconstruir el contenedor.

## Persistencia de Datos

Los datos de Firebase Emulators se guardan en el volumen `firestore-data`. Esto significa que:

- Los datos persisten entre reinicios del contenedor
- Los datos se mantienen al hacer `docker-compose down` (pero se eliminan con `docker-compose down -v`)
- Los datos se comparten entre diferentes ejecuciones

## Desarrollo Local vs Docker

### Ventajas de Docker

- ✅ No requiere instalar Node.js, npm o Firebase Tools
- ✅ Entorno consistente entre desarrolladores
- ✅ Aislamiento del sistema host
- ✅ Fácil limpieza (solo eliminar contenedores)

### Cuándo Usar Cada Opción

**Usa Docker si:**
- Es tu primera vez en el proyecto
- Quieres evitar instalar dependencias localmente
- Trabajas en múltiples proyectos con diferentes versiones de Node
- Quieres un entorno completamente aislado

**Usa desarrollo local si:**
- Ya tienes Node.js y Firebase Tools instalados
- Prefieres mejor rendimiento (sin virtualización)
- Necesitas debuggear con herramientas nativas
- Trabajas con extensiones de IDE que requieren Node local

## Troubleshooting

### Puerto Ya en Uso

Si obtienes errores de "port already in use":

**macOS/Linux:**
```bash
lsof -i :5173
kill -9 <PID>
```

**Windows:**
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

O cambia los puertos en `docker-compose.yml`:
```yaml
ports:
  - "5174:5173"  # Cambiar puerto host
```

### Hot Reload No Funciona

1. Verifica que el volumen esté montado:
   ```bash
   docker-compose exec app ls -la /app/src
   ```

2. Verifica permisos de archivos

3. Asegúrate de que Vite esté observando el directorio correcto

### Firebase Emulators No Inician

1. Revisa los logs:
   ```bash
   docker-compose logs app
   ```

2. Verifica que Firebase Tools esté instalado:
   ```bash
   docker-compose exec app firebase --version
   ```

3. Verifica la configuración en `firebase.json`

4. Asegúrate de que el directorio `firestore_export` exista o se cree automáticamente

### Problemas con Node Modules

Si encuentras errores de resolución de módulos:

1. Reconstruye el contenedor:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. Limpia el volumen de node_modules:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

3. Verifica el montaje del volumen:
   ```bash
   docker-compose exec app ls -la /app/node_modules
   ```

### Contenedor No Inicia

1. Verifica que Docker esté corriendo
2. Revisa la sintaxis del Dockerfile
3. Revisa los logs: `docker-compose logs`
4. Reconstruye sin cache: `docker-compose build --no-cache`

### Cambios en package.json No se Reflejan

Después de agregar o modificar dependencias en `package.json`:

1. Reconstruye la imagen:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

2. O reinstala dentro del contenedor:
   ```bash
   docker-compose exec app npm install
   ```

## Mejores Prácticas

1. **Usa docker-compose siempre** para mantener consistencia en el equipo
2. **No commitees node_modules** - están en `.dockerignore`
3. **Usa volúmenes** para persistencia de datos importantes
4. **Revisa logs primero** cuando algo no funcione
5. **Reconstruye después de cambios** en Dockerfile o package.json
6. **Limpia periódicamente** imágenes y contenedores no usados:
   ```bash
   docker system prune
   ```

## Integración con CI/CD

Para usar Docker en CI/CD, puedes usar el mismo `Dockerfile` y `docker-compose.yml`, o crear variantes optimizadas para producción.

## Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Vite Documentation](https://vite.dev/)
