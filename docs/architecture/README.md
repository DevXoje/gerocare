# Arquitectura del Proyecto - GeroCare

Esta documentación describe la arquitectura del proyecto GeroCare, las herramientas de análisis y visualización disponibles, y cómo utilizarlas.

---

## Tabla de Contenidos

1. [Arquitectura Clean Architecture](#arquitectura-clean-architecture)
2. [Capas de la Arquitectura](#capas-de-la-arquitectura)
3. [Reglas de Dependencias](#reglas-de-dependencias)
4. [Módulos de Negocio](#módulos-de-negocio)
5. [Herramientas de Análisis](#herramientas-de-análisis)
6. [Generación de Reportes](#generación-de-reportes)
7. [Validación en CI/CD](#validación-en-cicd)

---

## Arquitectura Clean Architecture

GeroCare sigue los principios de **Clean Architecture**, que separa el código en capas con responsabilidades claras y dependencias unidireccionales.

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│           Presentation (Vue Components)             │
│  ───────────────────────────────────────────────    │
│  - Componentes Vue                                  │
│  - Páginas                                          │
│  - Layouts                                          │
└────────────────────┬────────────────────────────────┘
                     │ usa
┌────────────────────▼────────────────────────────────┐
│           Application (Use Cases)                   │
│  ───────────────────────────────────────────────    │
│  - Composables (useXXX)                             │
│  - Handlers de formularios                          │
│  - Lógica de aplicación                             │
└────────────────────┬────────────────────────────────┘
                     │ depende de
┌────────────────────▼────────────────────────────────┐
│              Domain (Entidades)                     │
│  ───────────────────────────────────────────────    │
│  - Entidades de negocio                             │
│  - Interfaces de repositorios                       │
│  - Esquemas de validación (Zod)                     │
│  - Tipos de errores                                 │
└────┬────────────────────────────────────────────────┘
     │
     │ implementa
┌────▼────────────────────────────────────────────────┐
│        Infrastructure (Implementaciones)            │
│  ───────────────────────────────────────────────    │
│  - Firebase/Firestore                               │
│  - Repositorios concretos                           │
│  - Servicios externos                               │
└─────────────────────────────────────────────────────┘
```

Ver diagramas Mermaid en: [`architecture-layers.mmd`](./architecture-layers.mmd)

---

## Capas de la Arquitectura

### 1. Domain (`src/business/*/domain/`)

**Responsabilidad**: Lógica de negocio pura, independiente de frameworks y librerías externas.

**Contenido**:
- Entidades de negocio (ej: `Resident.ts`, `Medication.ts`)
- Interfaces de repositorios (ej: `ResidentRepository.ts`)
- Esquemas de validación Zod (ej: `Resident.schema.ts`)
- Tipos de errores de dominio (ej: `ResidentErrors.ts`)

**Reglas**:
- ✅ Puede importar de `shared/domain` y `shared/validation`
- ❌ **NO** puede importar de otras capas (app, infrastructure, presentation)
- ❌ **NO** debe importar de otros módulos de negocio

### 2. Application (`src/business/*/app/`)

**Responsabilidad**: Casos de uso y orquestación de la lógica de negocio.

**Contenido**:
- Composables Vue (ej: `useResidentForm.ts`, `useAuth.ts`)
- Handlers de formularios
- Helpers de aplicación

**Reglas**:
- ✅ Puede importar de `domain` del mismo módulo
- ✅ Puede importar de `shared`
- ❌ **NO** puede importar de `infrastructure`
- ❌ **NO** puede importar de `presentation`

### 3. Infrastructure (`src/business/*/infrastructure/`)

**Responsabilidad**: Implementaciones concretas de repositorios y servicios externos.

**Contenido**:
- Repositorios Firestore (ej: `FirestoreResidentRepository.ts`)
- Implementaciones de interfaces de dominio
- Seeds y datos de prueba

**Reglas**:
- ✅ Puede importar de `domain` del mismo módulo
- ✅ Puede importar de `shared`
- ❌ **NO** puede importar de `app` o `presentation`

### 4. Presentation (`src/business/*/presentation/`)

**Responsabilidad**: Componentes Vue y UI.

**Contenido**:
- Componentes Vue (atoms, molecules, organisms)
- Páginas
- Layouts

**Reglas**:
- ✅ Puede importar de `app` del mismo módulo
- ✅ Puede importar de `domain` del mismo módulo
- ✅ Puede importar de `shared` y `@design-system/*` (componentes UI compartidos)
- ❌ **NO** puede importar de `infrastructure`
- ⚠️ **Evitar** importar de `presentation` de otros módulos

---

## Reglas de Dependencias

Las dependencias deben seguir esta dirección:

```
Presentation → Application → Domain ← Infrastructure
```

### Reglas Específicas

1. **Presentation** solo puede importar de:
   - `app/` (composables)
   - `domain/` (tipos y esquemas)
   - `shared/` (utilidades compartidas)
   - `@design-system/*` (componentes UI compartidos, alias que apunta a `src/ui/`)

2. **Application** solo puede importar de:
   - `domain/` (entidades y repositorios)
   - `shared/` (utilidades compartidas)

3. **Domain** solo puede importar de:
   - `shared/domain` (tipos compartidos)
   - `shared/validation` (utilidades de validación)

4. **Infrastructure** puede importar de:
   - `domain/` (para implementar interfaces)
   - `shared/` (utilidades compartidas)

Ver diagrama de reglas: [`clean-architecture-rules.mmd`](./clean-architecture-rules.mmd)

---

## Módulos de Negocio

Cada módulo de negocio sigue la misma estructura de capas:

- `auth/` - Autenticación y gestión de usuarios
- `residents/` - Gestión de residentes
- `incidents/` - Gestión de incidentes
- `medication/` - Administración de medicación
- `activity-logs/` - Registro de actividades
- `care-plans/` - Planes de cuidado
- `shifts/` - Gestión de turnos
- `dashboard/` - Panel de control
- `reports/` - Reportes

Ver diagrama de módulos: [`architecture-modules.mmd`](./architecture-modules.mmd)

---

## Herramientas de Análisis

El proyecto incluye herramientas para analizar y visualizar el estado del código:

### 1. Dependency Cruiser

**Propósito**: Analizar y validar dependencias entre módulos y capas.

**Configuración**: [`.dependency-cruiser.js`](../../.dependency-cruiser.js)

**Scripts disponibles**:
```bash
# Generar reporte HTML de dependencias
npm run analyze:deps

# Generar gráfico Mermaid de dependencias
npm run analyze:deps:graph

# Validar arquitectura (falla si hay violaciones)
npm run analyze:deps:validate
```

**Reportes generados**:
- `reports/code-analysis/dependencies.html` - Reporte HTML interactivo
- `docs/architecture/dependency-graph.mmd` - Gráfico Mermaid

### 2. Métricas de Código

**Propósito**: Calcular métricas de líneas de código, archivos y distribución por módulo/capa.

**Script**: [`src/scripts/code-metrics.ts`](../../src/scripts/code-metrics.ts)

**Scripts disponibles**:
```bash
# Calcular métricas y guardar en JSON
npm run analyze:metrics

# Mostrar resumen en consola
npm run analyze:metrics:summary
```

**Reportes generados**:
- `reports/code-analysis/metrics.json` - Métricas en formato JSON

### 3. Diagramas de Arquitectura

**Propósito**: Generar diagramas Mermaid de la arquitectura.

**Script**: [`src/scripts/generate-architecture-diagrams.ts`](../../src/scripts/generate-architecture-diagrams.ts)

**Scripts disponibles**:
```bash
# Generar diagramas Mermaid
npm run analyze:architecture
```

**Diagramas generados**:
- `docs/architecture/architecture-layers.mmd` - Diagrama de capas
- `docs/architecture/architecture-modules.mmd` - Diagrama de módulos
- `docs/architecture/clean-architecture-rules.mmd` - Reglas de Clean Architecture

### 4. Dashboard HTML Consolidado

**Propósito**: Dashboard interactivo con todas las métricas y visualizaciones.

**Script**: [`src/scripts/generate-code-dashboard.ts`](../../src/scripts/generate-code-dashboard.ts)

**Scripts disponibles**:
```bash
# Generar dashboard completo
npm run analyze:dashboard
```

**Reportes generados**:
- `reports/code-analysis/index.html` - Dashboard HTML interactivo

---

## Generación de Reportes

### Generar todos los reportes

```bash
# Ejecutar todos los análisis y generar dashboard
npm run analyze:all
```

Este comando ejecuta en orden:
1. `analyze:deps` - Análisis de dependencias
2. `analyze:metrics` - Cálculo de métricas
3. `analyze:architecture` - Generación de diagramas
4. `analyze:dashboard` - Dashboard consolidado

### Flujo recomendado

```bash
# 1. Validar arquitectura
npm run analyze:deps:validate

# 2. Generar métricas
npm run analyze:metrics:summary

# 3. Generar todos los reportes
npm run analyze:all

# 4. Abrir dashboard en el navegador
open reports/code-analysis/index.html
```

---

## Validación en CI/CD

La validación de arquitectura está integrada en el pipeline de CI/CD de GitHub Actions.

### Workflow de CI

Archivo: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

El job `validate-architecture` ejecuta `npm run analyze:deps:validate` y falla si detecta violaciones críticas de arquitectura.

### Violaciones que hacen fallar el build

- ❌ `presentation` importando de `infrastructure`
- ❌ `app` importando de `infrastructure` o `presentation`
- ❌ `domain` importando de otras capas

### Violaciones que generan advertencias

- ⚠️ `presentation` importando de otros módulos `presentation`
- ⚠️ `domain` importando de otros módulos `domain`

---

## Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [Mermaid Diagrams](https://mermaid.js.org/)

---

## Mantenimiento

Los diagramas y reportes se generan automáticamente. Para actualizarlos:

```bash
npm run analyze:all
```

Los diagramas Mermaid están en `docs/architecture/` y pueden visualizarse en:
- GitHub (renderizado automático en Markdown)
- Editores como VS Code con extensión Mermaid
- Herramientas online como [mermaid.live](https://mermaid.live)
