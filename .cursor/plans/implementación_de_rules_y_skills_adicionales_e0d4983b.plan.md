---
name: Implementación de Rules y Skills Adicionales
overview: Plan incremental para implementar Rules de Cursor y Skills adicionales (firebase, clean-architecture) que complementen el sistema de skills existente, empezando por easy wins de alto impacto.
todos:
  - id: create-rules
    content: "Crear Rules: clean-architecture.md y vue-patterns.md en .cursor/rules/"
    status: completed
  - id: create-firebase-skill
    content: Crear skill firebase con patrones de Auth y Firestore
    status: completed
  - id: create-clean-arch-skill
    content: Crear skill clean-architecture para validación de arquitectura
    status: completed
  - id: update-cross-references
    content: Actualizar referencias cruzadas en skills existentes
    status: completed
  - id: update-agents-md
    content: Actualizar AGENTS.md con Rules y nuevas skills
    status: completed
isProject: false
---

# Plan de Implementación de Rules y Skills Adicionales

## Objetivo

Implementar Rules y Skills adicionales para mejorar el contexto y guía del AI en Cursor, complementando las skills ya optimizadas.

## Fase 1: Crear Rules de Cursor (Prioridad Alta)

### Objetivo

Crear reglas siempre activas que guíen decisiones arquitectónicas y patrones de Vue.

### Tareas

#### 1.1 Crear `.cursor/rules/clean-architecture.md`

**Contenido a incluir:**

- Reglas de dependencias entre capas (Domain → App → Infrastructure → Presentation)
- Principios de Clean Architecture aplicados a GeroCare
- Reglas específicas de importación por capa
- Validación de arquitectura (referencia a dependency-cruiser)
- Patrones de repositorios y composables

**Basado en:**

- `docs/architecture/README.md`
- `.cursor/skills/feature-development/SKILL.md`
- Patrones existentes en `src/business/*/`

#### 1.2 Crear `.cursor/rules/vue-patterns.md`

**Contenido a incluir:**

- Estructura estándar de componentes Vue (`<script setup>`, `defineOptions`, props, emits)
- Patrones de composables (naming, estructura, retorno)
- Uso de Pinia stores vs composables
- Patrones de formularios y validación
- Directivas y patrones comunes de Vue 3

**Basado en:**

- `docs/CODING_STYLE.md` (sección de componentes Vue)
- `.cursor/skills/coding-style/SKILL.md`
- Patrones existentes en componentes del proyecto

#### 1.3 Actualizar `AGENTS.md`

**Cambios:**

- Agregar sección "Rules" que referencia las nuevas rules
- Explicar cuándo usar Rules vs Skills
- Mantener tabla de skills existente

### Archivos a crear

- `.cursor/rules/clean-architecture.md`
- `.cursor/rules/vue-patterns.md`

### Archivos a modificar

- `AGENTS.md` - Agregar sección de Rules

---

## Fase 2: Crear Skill `firebase` (Prioridad Alta)

### Objetivo

Crear skill especializada en patrones de Firebase (Auth y Firestore) para GeroCare.

### Tareas

#### 2.1 Crear estructura de skill

**Estructura:**

```
.cursor/skills/firebase/
├── SKILL.md
└── assets/
    └── examples/
        ├── auth-patterns.ts
        └── firestore-patterns.ts
```

#### 2.2 Contenido del SKILL.md

**Secciones principales:**

- **When to Use**: Trabajar con Firebase Auth, Firestore, emulators
- **Critical Patterns**:
  - Patrones de Auth (signIn, signUp, signOut, Google Auth)
  - Patrones de Firestore (CRUD, queries, date conversion)
  - Manejo de errores Firebase (mapeo de errores a errores de dominio)
  - Configuración de emulators
  - Offline support patterns
- **Code Examples**: Ejemplos de repositorios Auth y Firestore
- **Commands**: Comandos de Firebase emulators
- **Resources**: Referencias a configuración, documentación

**Patrones clave a documentar:**

1. **Auth Repository Pattern**:

   - Mapeo de errores Firebase a errores de dominio
   - Uso de Result type
   - Ejemplo: `FirestoreAuth.ts`

2. **Firestore Repository Pattern**:

   - Conversión Timestamp ↔ Date
   - Validación con Zod al leer de Firestore
   - Queries con where, orderBy
   - Ejemplo: `FirestoreResidentRepository.ts`

3. **Error Mapping**:

   - Mapeo de códigos de error Firebase
   - Creación de errores de dominio específicos
   - Logging de errores

4. **Emulator Configuration**:

   - Configuración en desarrollo
   - Conexión a emulators
   - Testing con emulators

**Basado en:**

- `src/business/auth/infrastructure/FirestoreAuth.ts`
- `src/business/residents/infrastructure/FirestoreResidentRepository.ts`
- `src/shared/infrastructure/firebase/firebase.config.ts`
- `src/business/activity-logs/infrastructure/FirestoreActivityLogRepository.ts`

#### 2.3 Crear ejemplos en assets/

**auth-patterns.ts**: Ejemplos de patrones de Auth

**firestore-patterns.ts**: Ejemplos de patrones de Firestore

### Archivos a crear

- `.cursor/skills/firebase/SKILL.md`
- `.cursor/skills/firebase/assets/examples/auth-patterns.ts`
- `.cursor/skills/firebase/assets/examples/firestore-patterns.ts`

### Archivos a modificar

- `AGENTS.md` - Agregar skill `firebase` a la tabla

---

## Fase 3: Crear Skill `clean-architecture` (Prioridad Media)

### Objetivo

Crear skill especializada en validación y guías de Clean Architecture, complementando `feature-development`.

### Tareas

#### 3.1 Crear estructura de skill

**Estructura:**

```
.cursor/skills/clean-architecture/
├── SKILL.md
└── assets/
    └── validation-rules.md
```

#### 3.2 Contenido del SKILL.md

**Secciones principales:**

- **When to Use**: Validar arquitectura, verificar dependencias, entender reglas de capas
- **Critical Patterns**:
  - Reglas de dependencias por capa
  - Validación de imports
  - Estructura de directorios
  - Validación con dependency-cruiser
- **Decision Trees**: Cuándo usar cada capa
- **Commands**: Comandos de validación de arquitectura
- **Resources**: Referencias a documentación de arquitectura

**Diferenciación con `feature-development`:**

- `feature-development`: Cómo crear features siguiendo Clean Architecture
- `clean-architecture`: Cómo validar y mantener la arquitectura correcta

**Basado en:**

- `docs/architecture/README.md`
- `.dependency-cruiser.js` (si existe)
- Reglas de dependencias documentadas

#### 3.3 Crear guía de validación

**validation-rules.md**: Reglas específicas de validación con ejemplos

### Archivos a crear

- `.cursor/skills/clean-architecture/SKILL.md`
- `.cursor/skills/clean-architecture/assets/validation-rules.md`

### Archivos a modificar

- `AGENTS.md` - Agregar skill `clean-architecture` a la tabla

---

## Fase 4: Actualizar Referencias Cruzadas (Prioridad Media)

### Objetivo

Actualizar skills existentes para referenciar las nuevas rules y skills.

### Tareas

#### 4.1 Actualizar `feature-development`

- Referenciar rule `clean-architecture.md`
- Referenciar skill `clean-architecture` para validación
- Referenciar skill `firebase` para implementaciones de infraestructura

#### 4.2 Actualizar `coding-style`

- Referenciar rule `vue-patterns.md`
- Mantener referencias existentes

#### 4.3 Actualizar `zod`

- Referenciar `feature-development` (ya existe, verificar)
- Mantener referencias existentes

### Archivos a modificar

- `.cursor/skills/feature-development/SKILL.md`
- `.cursor/skills/coding-style/SKILL.md`
- `.cursor/skills/zod/SKILL.md` (si es necesario)

---

## Orden de Ejecución

1. **Fase 1** (Rules) - Base para todo, siempre activas
2. **Fase 2** (Skill firebase) - Alto valor, patrones específicos
3. **Fase 3** (Skill clean-architecture) - Complementa feature-development
4. **Fase 4** (Referencias) - Integra todo el sistema

---

## Consideraciones

### Rules vs Skills

**Rules** (siempre activas):

- Reglas arquitectónicas fundamentales
- Patrones de Vue que siempre deben seguirse
- Decisiones de diseño que no cambian

**Skills** (on-demand):

- Patrones específicos de tecnologías (Firebase)
- Guías de validación y herramientas
- Workflows complejos

### Diferenciación de Skills

- **`feature-development`**: Cómo crear features (guía de implementación)
- **`clean-architecture`**: Cómo validar arquitectura (guía de validación)
- **`firebase`**: Patrones específicos de Firebase (Auth, Firestore)
- **`coding-style`**: Estilo y formato de código

---

## Métricas de Éxito

- 2 Rules creadas y documentadas
- 2 Skills adicionales creadas
- Todas las referencias cruzadas actualizadas
- `AGENTS.md` actualizado con nuevas resources
- Sistema completo e integrado

---

## Notas

- Las Rules son siempre activas, así que deben ser concisas y críticas
- Las Skills deben tener ejemplos prácticos basados en código real del proyecto
- Mantener consistencia con el estilo y estructura de skills existentes
- Todas las referencias deben ser bidireccionales cuando sea apropiado