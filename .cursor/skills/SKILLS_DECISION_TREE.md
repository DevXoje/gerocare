# Árbol de Decisión de Skills

Este documento ayuda a decidir qué skill usar en diferentes situaciones.

## Flujo Principal de Desarrollo

```
¿Qué necesitas hacer?
│
├─ ¿Crear nueva funcionalidad/feature?
│  └─ → feature-development
│
├─ ¿Escribir código?
│  └─ → coding-style (para estilo y convenciones)
│
├─ ¿Crear tests?
│  └─ → testing
│
├─ ¿Trabajar con Docker?
│  └─ → docker
│
└─ ¿Crear nueva skill?
   └─ → skill-creator
```

## Flujo de Diseño y UI

```
¿Qué necesitas hacer?
│
├─ ¿Investigar usuarios, crear personas?
│  └─ → ux-researcher-designer
│
├─ ¿Crear diseño visual, estética?
│  └─ → frontend-ui-ux
│
├─ ¿Crear/actualizar design tokens?
│  └─ → ui-design-system
│
├─ ¿Implementar componentes UI?
│  └─ → ui-components
│
└─ ¿Extraer mockups de Stitch?
   └─ → extracting-stitch-mockups
```

## Flujo de Validación y Datos

```
¿Qué necesitas hacer?
│
├─ ¿Validar datos con esquemas?
│  └─ → zod
│
└─ ¿Validar estructura de entidades?
   └─ → feature-development (incluye validación en domain layer)
```

## Decisiones Específicas

### ¿feature-development vs coding-style?

- **feature-development**: Estructura, arquitectura, capas (domain, app, infrastructure, presentation)
- **coding-style**: Estilo de código, formato, convenciones de nombres, patrones de TypeScript/Vue

**Ejemplo:**
- Crear nueva feature → `feature-development`
- Refactorizar código existente → `coding-style`
- Ambos se usan juntos cuando creas una feature nueva

### ¿ux-researcher-designer vs frontend-ui-ux?

- **ux-researcher-designer**: Investigación, personas, journey mapping, testing de usabilidad
- **frontend-ui-ux**: Diseño visual, estética, implementación de interfaces visuales

**Ejemplo:**
- "Necesito entender a los usuarios" → `ux-researcher-designer`
- "Necesito diseñar una interfaz bonita" → `frontend-ui-ux`

### ¿ui-design-system vs ui-components?

- **ui-design-system**: Tokens, paletas de colores, tipografía, sistema visual
- **ui-components**: Patrones de componentes, implementación de componentes usando tokens

**Ejemplo:**
- "Necesito crear nuevos tokens de color" → `ui-design-system`
- "Necesito crear un componente Button" → `ui-components`

### ¿zod vs feature-development?

- **zod**: Específicamente para crear esquemas de validación Zod
- **feature-development**: Contexto completo de Clean Architecture donde Zod se usa

**Ejemplo:**
- "Necesito crear un schema Zod" → `zod`
- "Necesito crear una feature completa con validación" → `feature-development` (usa `zod` internamente)

## Triggers por Categoría

### Desarrollo Backend/Infraestructura
- `feature-development`: "creating new features", "domain entities", "repositories"
- `docker`: "Docker configuration", "troubleshooting Docker"
- `zod`: "validation schemas", "validating data"

### Desarrollo Frontend
- `ui-components`: "creating UI components", "reusable components"
- `frontend-ui-ux`: "UI/UX designs", "visual interfaces"
- `ui-design-system`: "design tokens", "color palettes", "design system"

### Testing
- `testing`: "creating tests", "test helpers", "testing infrastructure"

### UX/Research
- `ux-researcher-designer`: "user research", "personas", "journey mapping", "usability testing"

### Utilidades
- `extracting-stitch-mockups`: "Stitch project URL", "extracting mockups"
- `skill-creator`: "create a new skill", "agent instructions"
- `coding-style`: "writing code", "refactoring", "style decisions"

## Solapamientos Esperados

Algunos triggers se solapan intencionalmente porque las skills se usan juntas:

- **"creating"**: Aparece en múltiples skills porque es un verbo común
  - `feature-development`: "creating new features"
  - `ui-components`: "creating UI components"
  - `testing`: "creating tests"
  - Esto es normal y esperado

- **"components"**: 
  - `ui-components`: Para componentes UI agnósticos
  - `feature-development`: Para componentes específicos de features
  - Diferencia: agnóstico vs específico de feature

- **"design"**:
  - `ui-design-system`: Sistema de diseño, tokens
  - `ux-researcher-designer`: Investigación de diseño
  - `frontend-ui-ux`: Diseño visual
  - Diferencia: tokens vs research vs visual

## Mejores Prácticas

1. **Usa múltiples skills cuando sea necesario**: No son mutuamente excluyentes
   - Ejemplo: Crear feature → `feature-development` + `coding-style` + `testing`

2. **Sigue el flujo natural**:
   - Research → Design System → Components → Implementation

3. **Consulta el skill más específico primero**:
   - "Validar con Zod" → `zod` (más específico que `feature-development`)

4. **Usa el contexto del proyecto**:
   - Si estás en `src/business/{feature}/domain/` → probablemente `feature-development`
   - Si estás en `src/ui/` → probablemente `ui-components`

## Referencias Rápidas

| Necesitas | Skill |
|-----------|-------|
| Nueva feature completa | `feature-development` |
| Estilo de código | `coding-style` |
| Tests | `testing` |
| Componentes UI | `ui-components` |
| Design tokens | `ui-design-system` |
| Diseño visual | `frontend-ui-ux` |
| UX research | `ux-researcher-designer` |
| Validación Zod | `zod` |
| Docker | `docker` |
| Extraer Stitch | `extracting-stitch-mockups` |
| Crear skill | `skill-creator` |
