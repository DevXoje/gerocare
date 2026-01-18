# CI/CD Local con act

Esta guía explica cómo ejecutar workflows de GitHub Actions localmente usando `act`, sin costos de cloud computing.

## Quick Start

```bash
# 1. Instalar act
brew install act  # macOS

# 2. Verificar instalación
act --version

# 3. Ejecutar checks rápidos (lint, type-check, format)
npm run act:ci:fast

# 4. Ejecutar CI completo
npm run act:ci

# 5. Ver todos los workflows disponibles
npm run act:list
```

**Scripts útiles:**
- `npm run ci:local` - Ejecutar checks sin act (más rápido para desarrollo)
- `npm run act:ci:fast` - Solo checks rápidos (lint, type-check, format)
- `npm run act:ci:full` - CI completo con tests E2E
- `npm run test:coverage` - Ejecutar tests con coverage localmente

## Tabla de Contenidos

- [Quick Start](#quick-start)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Workflows Disponibles](#workflows-disponibles)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Limitaciones](#limitaciones)
- [Ejemplos Avanzados](#ejemplos-avanzados)

## Requisitos

- **Docker Desktop**: Debe estar instalado y ejecutándose
- Espacio en disco: ~2GB para imágenes y cache

## Instalación

### macOS

```bash
# Opción 1: Homebrew (recomendado)
brew install act

# Opción 2: Instalación manual
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Linux

```bash
# Instalación con script
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# O con gestor de paquetes (Ubuntu/Debian)
# (requiere agregar repositorio primero)
```

### Windows

```bash
# Con Chocolatey
choco install act-cli

# Con Scoop
scoop install act
```

### Verificar instalación

```bash
act --version
```

## Configuración

### Primera ejecución

La primera vez que ejecutes act, te preguntará qué imagen Docker usar. Recomendamos:

```
Medium: ghcr.io/catthehacker/ubuntu:act-latest
```

Esta configuración se guarda en `~/.actrc`.

### Variables de Entorno (Opcional)

Si necesitas configurar secrets o variables de entorno:

1. Crear archivo `.github/act/.secrets`:
```bash
GITHUB_TOKEN=tu_token_aqui
OTRA_VARIABLE=valor
```

2. O usar el flag `-s` en los comandos:
```bash
act -s GITHUB_TOKEN=token -W .github/workflows/ci.yml
```

## Uso

### Comandos Básicos

Ejecutar workflows usando los scripts npm configurados:

```bash
# Listar todos los workflows disponibles
npm run act:list

# Ejecutar workflow de CI (lint, type-check, tests)
npm run act:ci

# Ejecutar workflow de build
npm run act:build

# Ejecutar workflow de auditorías
npm run act:audit

# Ejecutar todos los workflows
npm run act:all
```

### Comandos act Directos

También puedes ejecutar comandos de act directamente:

```bash
# Listar workflows
act -l

# Ejecutar workflow específico
act -W .github/workflows/ci.yml

# Ejecutar job específico
act -j lint -W .github/workflows/ci.yml

# Modo dry-run (mostrar qué haría sin ejecutar)
act -n

# Modo verbose para debugging
act -v -W .github/workflows/ci.yml
```

## Workflows Disponibles

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push a `main` o `dev`
- Pull requests a `main` o `dev`
- Ejecución manual

**Jobs:**
- **lint**: Ejecuta ESLint
- **type-check**: Valida tipos con TypeScript
- **test-unit**: Tests unitarios con Vitest
- **test-e2e**: Tests E2E con Playwright

**Comando:**
```bash
npm run act:ci
```

### 2. Build Workflow (`.github/workflows/build.yml`)

**Triggers:**
- Push/PR a `main` o `dev` (solo si cambian archivos relevantes)
- Ejecución manual

**Jobs:**
- **build**: Build de producción y validación de artefactos
- Build de Storybook (opcional)

**Comando:**
```bash
npm run act:build
```

### 3. Audit Workflow (`.github/workflows/audit.yml`)

**Triggers:**
- Ejecución manual
- Programado (domingos a las 2 AM UTC)

**Jobs:**
- **accessibility**: Tests de accesibilidad y Lighthouse

**Comando:**
```bash
npm run act:audit
```

### 4. Dependencies Workflow (`.github/workflows/dependencies.yml`)

**Triggers:**
- Ejecución manual
- Programado (lunes a las 2 AM UTC)
- Push de `package.json` o `package-lock.json`

**Jobs:**
- **audit**: Security audit con `npm audit`
- **outdated**: Verificar dependencias desactualizadas

**Comando:**
```bash
npm run act:dependencies
```

## Best Practices

### Flujo de Trabajo Recomendado

1. **Antes de commit**: Ejecutar checks rápidos
   ```bash
   npm run ci:local
   # o
   npm run act:ci:fast
   ```

2. **Antes de push**: Ejecutar CI completo
   ```bash
   npm run act:ci:full
   ```

3. **En PRs**: Los workflows se ejecutarán automáticamente (si usas GitHub)

### Optimización de Tiempo

- Usa `npm run ci:local` para feedback rápido durante desarrollo
- Usa `act:ci:fast` para validar rápidamente con act
- Ejecuta tests E2E solo antes de merge importantes
- Usa cache: act reutiliza imágenes Docker entre ejecuciones

### Configuración del Proyecto

El proyecto incluye `.actrc` con configuración optimizada:
- Imagen por defecto: `ghcr.io/catthehacker/ubuntu:act-latest`
- Reutilización de contenedores habilitada (`-r`)
- Arquitectura: `linux/amd64`

### Coverage y Reporting

- Coverage se genera automáticamente en CI con `test:unit -- --coverage`
- Ejecutar localmente: `npm run test:coverage`
- Reports se suben como artefactos en GitHub Actions

### Secrets y Variables

- Templates de secrets en `.github/act/.secrets.example`
- No subir secrets reales al repositorio (están en `.gitignore`)
- Usar `act -s VARIABLE=valor` para secrets temporales

## Troubleshooting

### Error: "act: command not found"

**Problema:** act no está instalado.

**Solución:**
1. Instalar act según las [instrucciones de instalación](#instalación)
2. Verificar instalación: `act --version`

### Error: "Cannot connect to Docker daemon"

**Problema:** act no puede acceder al daemon de Docker.

**Solución:**
1. Verifica que Docker Desktop esté corriendo:
```bash
docker ps
```

2. Verifica permisos del socket de Docker:
```bash
ls -la /var/run/docker.sock
```

3. En algunos sistemas, necesitas agregar tu usuario al grupo `docker`:
```bash
sudo usermod -aG docker $USER
```

### Error: "No space left on device"

**Problema:** Docker se quedó sin espacio en disco.

**Solución:**
1. Limpia imágenes y volúmenes no usados:
```bash
docker system prune -a --volumes
```

2. Limpia cache de act específicamente:
```bash
rm -rf ~/.cache/act
```

### Error: "workflow file not found"

**Problema:** act no encuentra el archivo de workflow.

**Solución:**
1. Verifica que el archivo existe:
```bash
ls -la .github/workflows/
```

2. Usa rutas correctas (desde la raíz del proyecto):
```bash
npm run act:ci  # Usa la ruta correcta: .github/workflows/ci.yml
```

### Tests E2E fallan

**Problema:** Playwright no puede instalar navegadores o falla la ejecución.

**Solución:**
1. Los tests E2E pueden ser lentos en act. Considera ejecutar solo jobs específicos:
```bash
act -j test-unit -W .github/workflows/ci.yml
```

2. O ejecuta los tests E2E directamente sin act:
```bash
npm run test:e2e
```

### Ejecución muy lenta

**Problema:** Primera ejecución tarda mucho.

**Solución:**
- La primera ejecución descarga imágenes Docker y cache. Es normal que tarde.
- Ejecuciones posteriores serán más rápidas gracias al cache.
- Usa el flag `-r` para reutilizar contenedores entre jobs:
```bash
act -r -W .github/workflows/ci.yml
```

### Error: "pull access denied"

**Problema:** act no puede descargar imágenes de acciones.

**Solución:**
1. Especifica una plataforma de imagen alternativa:
```bash
act -P ubuntu-latest=node:20.19.0 -W .github/workflows/ci.yml
```

2. O usa imágenes optimizadas para act:
```bash
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest -W .github/workflows/ci.yml
```

## Limitaciones

### Acciones no soportadas

Algunas acciones de GitHub no funcionan localmente:

- ❌ Acciones que requieren GitHub API (comentarios en PRs, labels, etc.)
- ❌ GitHub Container Registry (ghcr.io) puede requerir autenticación
- ❌ Servicios específicos de GitHub (artifacts, cache API, etc.)

**Solución:** act usa alternativas locales para estas acciones cuando es posible.

### Servicios de Docker

Si necesitas servicios como bases de datos o Firebase emulators:

```yaml
# En tu workflow
services:
  firestore:
    image: google/cloud-sdk:emulators
    # ... configuración
```

### Secrets y Variables

Los secrets deben configurarse manualmente (ver [Variables de Entorno](#variables-de-entorno-opcional)).

## Ejemplos Avanzados

### Ejecutar solo un job específico

```bash
# Solo lint
act -j lint -W .github/workflows/ci.yml

# Solo tests unitarios
act -j test-unit -W .github/workflows/ci.yml
```

### Dry-run (ver qué haría sin ejecutar)

```bash
act -n -W .github/workflows/ci.yml
```

### Modo verbose para debugging

```bash
act -v -W .github/workflows/ci.yml
```

### Especificar evento (trigger)

```bash
# Simular push
act push -W .github/workflows/ci.yml

# Simular pull_request
act pull_request -W .github/workflows/ci.yml

# Simular workflow_dispatch (ejecución manual)
act workflow_dispatch -W .github/workflows/audit.yml
```

### Usar archivo de secrets

```bash
act --secret-file .github/act/.secrets -W .github/workflows/ci.yml
```

### Ejecutar en plataforma específica

```bash
# Node 20.19.0 (coincide con el proyecto)
act -P ubuntu-latest=node:20.19.0 -W .github/workflows/ci.yml

# Imagen optimizada para act
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest -W .github/workflows/ci.yml
```

### Reutilizar contenedores entre jobs

```bash
act -r -W .github/workflows/ci.yml
```

## Integración con Git Hooks

Puedes ejecutar workflows antes de commit o push usando git hooks.

### Pre-commit hook

Crear `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "🔍 Running lint and type-check..."
npm run act:ci -j lint -j type-check

if [ $? -ne 0 ]; then
  echo "❌ CI checks failed. Commit aborted."
  exit 1
fi
```

### Pre-push hook

Crear `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "🔍 Running full CI pipeline..."
npm run act:ci

if [ $? -ne 0 ]; then
  echo "❌ CI failed. Push aborted."
  exit 1
fi
```

## Comparación: act vs GitHub Actions en la nube

| Aspecto | act (local) | GitHub Actions |
|---------|-------------|----------------|
| **Costo** | Gratis | Gratis (con límites) o de pago |
| **Velocidad** | Rápido (después del primer run) | Variable (depende de la cola) |
| **Cache** | Local (persistente) | En la nube |
| **Debugging** | Fácil (acceso directo) | Limitado |
| **Secrets** | Manual | Automático |
| **API GitHub** | Limitado | Completo |
| **Recursos** | Tu máquina | Runners de GitHub |

## Recursos Adicionales

- [Documentación oficial de act](https://github.com/nektos/act)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Docker Compose reference](https://docs.docker.com/compose/)

## Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Verifica los logs con modo verbose: `npm run act:ci -- -v`
2. Revisa issues en [nektos/act](https://github.com/nektos/act/issues)
3. Consulta la documentación del proyecto en `docs/`
