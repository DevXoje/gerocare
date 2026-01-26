# Guía de Skills de GeroCare

Esta guía proporciona una visión general de todas las skills disponibles, cuándo usarlas, y cómo se relacionan entre sí.

## Tabla de Contenidos

1. [Skills Disponibles](#skills-disponibles)
2. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
3. [Relaciones entre Skills](#relaciones-entre-skills)
4. [Árbol de Decisión](#árbol-de-decisión)
5. [Mejores Prácticas](#mejores-prácticas)

---

## Skills Disponibles

### Desarrollo y Arquitectura

| Skill | Propósito | Cuándo Usar |
|-------|-----------|-------------|
| `feature-development` | Patrones Clean Architecture para features completas | Crear nuevas features, entidades de dominio, repositorios, composables |
| `coding-style` | Convenciones de estilo y formato de código | Escribir código, refactorizar, decisiones de estilo |
| `zod` | Validación con esquemas Zod | Crear esquemas de validación, validar datos |
| `testing` | Estrategia y patrones de testing | Crear tests, helpers de testing, mocks |

### UI/UX y Diseño

| Skill | Propósito | Cuándo Usar |
|-------|-----------|-------------|
| `ux-researcher-designer` | Investigación UX y diseño centrado en usuario | Investigación de usuarios, personas, journey mapping, testing de usabilidad |
| `frontend-ui-ux` | Diseño visual y estética de interfaces | Crear diseños visuales, implementar estética, detalles pixel-perfect |
| `ui-design-system` | Design tokens y sistema visual | Crear/actualizar tokens, paletas de colores, documentar design system |
| `ui-components` | Patrones de componentes UI agnósticos | Crear componentes UI reutilizables, building component library |

### Infraestructura y Utilidades

| Skill | Propósito | Cuándo Usar |
|-------|-----------|-------------|
| `docker` | Configuración y troubleshooting de Docker | Trabajar con Docker, troubleshooting, setup de desarrollo |
| `extracting-stitch-mockups` | Extraer mockups de Google Stitch | Extraer/descargar mockups de proyectos Stitch |
| `skill-creator` | Crear nuevas skills siguiendo el estándar | Crear nuevas skills, documentar patrones para AI |

---

## Flujos de Trabajo Comunes

### Crear una Nueva Feature

```
1. feature-development  →  Define estructura y arquitectura
2. coding-style        →  Sigue convenciones de código
3. zod                 →  Crea esquemas de validación (si aplica)
4. testing             →  Escribe tests para la feature
```

**Ejemplo**: Crear feature de "medications"
- `feature-development`: Estructura domain/app/infrastructure/presentation
- `zod`: Schema de validación para Medication
- `coding-style`: Convenciones de nombres, formato
- `testing`: Tests unitarios e integración

### Flujo de Diseño Completo

```
1. ux-researcher-designer  →  Investiga usuarios, crea personas
2. frontend-ui-ux          →  Diseña interfaz visual
3. ui-design-system        →  Crea/actualiza design tokens
4. ui-components           →  Implementa componentes usando tokens
```

**Ejemplo**: Diseñar nueva pantalla de dashboard
- `ux-researcher-designer`: Entender necesidades de usuarios
- `frontend-ui-ux`: Diseñar layout y estética
- `ui-design-system`: Crear tokens de color si es necesario
- `ui-components`: Implementar componentes reutilizables

### Desarrollo de Componentes UI

```
1. ui-design-system  →  Verifica/crea tokens necesarios
2. ui-components     →  Implementa componente siguiendo patrones
3. coding-style      →  Sigue convenciones de código
4. testing           →  Escribe tests del componente
```

---

## Relaciones entre Skills

### Jerarquía de Diseño

```
ux-researcher-designer
    ↓
frontend-ui-ux
    ↓
ui-design-system
    ↓
ui-components
```

**Explicación**:
1. Research define necesidades
2. Diseño visual implementa estética
3. Design system crea tokens
4. Componentes usan tokens

### Desarrollo de Features

```
feature-development (arquitectura)
    ↓
coding-style (convenciones)
    ↓
zod (validación, si aplica)
    ↓
testing (calidad)
```

### Skills Complementarias

- **`feature-development` + `zod`**: Features con validación
- **`ui-components` + `ui-design-system`**: Componentes usando tokens
- **`coding-style` + cualquier skill**: Todas las skills siguen convenciones de código

---

## Árbol de Decisión

Para una guía detallada de cuándo usar cada skill, consulta: [SKILLS_DECISION_TREE.md](SKILLS_DECISION_TREE.md)

### Preguntas Rápidas

**¿Crear nueva funcionalidad?**
→ `feature-development`

**¿Escribir código?**
→ `coding-style` (para estilo)

**¿Crear tests?**
→ `testing`

**¿Diseñar interfaz?**
→ `frontend-ui-ux`

**¿Investigar usuarios?**
→ `ux-researcher-designer`

**¿Crear componentes?**
→ `ui-components`

**¿Trabajar con Docker?**
→ `docker`

**¿Validar datos?**
→ `zod`

---

## Mejores Prácticas

### 1. Usa Múltiples Skills

Las skills no son mutuamente excluyentes. Es común usar varias juntas:

```typescript
// Ejemplo: Crear feature con validación
// 1. feature-development → Estructura
// 2. zod → Schema de validación
// 3. coding-style → Formato
// 4. testing → Tests
```

### 2. Sigue el Flujo Natural

Respeta el orden lógico de las skills:

- Research → Design → Tokens → Components
- Architecture → Style → Validation → Testing

### 3. Consulta el Skill Más Específico

Si hay solapamiento, usa el más específico:

- "Validar con Zod" → `zod` (más específico que `feature-development`)
- "Componente UI" → `ui-components` (más específico que `coding-style`)

### 4. Usa el Contexto del Proyecto

La ubicación del código ayuda a decidir:

- `src/business/{feature}/domain/` → `feature-development`
- `src/ui/` → `ui-components`
- `src/business/{feature}/domain/*.schema.ts` → `zod`

### 5. Referencias Cruzadas

Las skills tienen secciones "Relationship with Other Skills" que ayudan a entender cómo se relacionan.

---

## Recursos Adicionales

- **Árbol de Decisión**: [SKILLS_DECISION_TREE.md](SKILLS_DECISION_TREE.md)
- **Reporte de Auditoría**: [AUDIT_REPORT.md](AUDIT_REPORT.md)
- **Análisis de Redundancias**: [REDUNDANCY_ANALYSIS.md](REDUNDANCY_ANALYSIS.md)
- **AGENTS.md**: [../../AGENTS.md](../../AGENTS.md) - Lista completa de skills

---

## Estado de las Skills

Todas las skills han sido auditadas y optimizadas:

- ✅ Metadata completa y estandarizada
- ✅ Secciones "When to Use" y "Don't use" claras
- ✅ Referencias cruzadas entre skills relacionadas
- ✅ Triggers optimizados y documentados
- ✅ Secciones "Resources" completas

Para más detalles sobre el estado de cada skill, consulta el [AUDIT_REPORT.md](AUDIT_REPORT.md).
