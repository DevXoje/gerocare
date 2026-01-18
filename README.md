# GeroCare

Aplicación web para asistir a gerocultores durante su jornada laboral, facilitando la gestión de residentes, registro de actividades, administración de medicación y comunicación entre el equipo de cuidado.

## Documentación

- **[Plan de Desarrollo](./docs/DEVELOPMENT_PLAN.md)**: Roadmap completo con todas las features planificadas, organizadas por fases, con detalles técnicos y criterios de aceptación.
- **[CI/CD Local](./docs/CI_LOCAL.md)**: Guía completa para ejecutar workflows de GitHub Actions localmente con act.

## Tecnologías

- Vue 3 + TypeScript
- Firebase (Auth, Firestore)
- VueFire
- Pinia
- Vite

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

### Desarrollo con Docker (Recomendado)

El entorno de desarrollo está completamente dockerizado. No necesitas instalar Node.js, npm o Firebase Tools localmente.

**Requisitos:**
- [Docker](https://www.docker.com/get-started) instalado

**Inicio rápido:**
```sh
# Construir e iniciar todos los servicios
docker-compose up --build

# O simplemente iniciar (si ya está construido)
docker-compose up

# Iniciar solo un servicio específico
docker-compose up emulators  # Solo Firebase emulators
docker-compose up app        # Solo Vite dev server
```

Una vez iniciado, accede a:
- **Aplicación**: http://localhost:5173
- **Firebase UI**: http://localhost:4000

Los servicios se comunican a través de una red interna de Docker. Para más detalles, comandos y troubleshooting, consulta la [documentación completa de Docker](./docs/DOCKER.md).

### Desarrollo Local (Opcional)

Si prefieres desarrollar sin Docker:

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Firebase Emulators

```sh
# Start Firebase emulators (Auth, Firestore, UI)
npm run emulators

# Start dev server with emulators
npm run dev:emulators
```

## CI/CD Local

El proyecto incluye workflows de GitHub Actions que puedes ejecutar localmente usando [act](https://github.com/nektos/act), sin costos de cloud computing.

### Quick Start

```sh
# Checks rápidos durante desarrollo (sin act, más rápido)
npm run ci:local

# CI completo con act (lint, type-check, format, tests, coverage)
npm run act:ci

# Solo checks rápidos con act (lint, type-check, format)
npm run act:ci:fast

# Build de producción
npm run act:build

# Listar todos los workflows disponibles
npm run act:list
```

### Scripts Disponibles

**Checks locales (sin act):**
- `npm run ci:local` - Ejecutar lint, type-check y tests unitarios

**Workflows con act:**
- `npm run act:ci` - CI completo
- `npm run act:ci:fast` - Solo checks rápidos (lint, type-check, format)
- `npm run act:ci:full` - CI completo incluyendo E2E
- `npm run act:build` - Build de producción
- `npm run act:audit` - Auditorías (accesibilidad, Lighthouse)
- `npm run act:dependencies` - Verificar dependencias y security

**Utilidades:**
- `npm run act:list` - Listar workflows disponibles
- `npm run test:coverage` - Ejecutar tests con coverage

Para más información, ejemplos avanzados y troubleshooting, consulta la [documentación completa de CI local](./docs/CI_LOCAL.md).
