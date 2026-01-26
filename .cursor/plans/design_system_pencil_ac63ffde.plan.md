---
name: Design System Pencil
overview: Crear un design system completo en Pencil para GeroCare, documentando todos los design tokens y componentes existentes (22 atoms, 9 molecules, 6 organisms) con un enfoque visual adaptado al contexto de salud y cuidado geriátrico.
todos:
  - id: "1"
    content: "Abrir nuevo documento Pencil y crear estructura base del design system (frames principales: Foundation, Atoms, Molecules, Organisms, Patterns)"
    status: in_progress
  - id: "2"
    content: "Documentar Foundation: crear componentes reutilizables para paleta de colores (Primary, Neutral, Semantic) con ejemplos de uso"
    status: pending
  - id: "3"
    content: "Documentar Foundation: crear escala tipográfica completa (xs → 2xl) con ejemplos visuales y especificaciones"
    status: pending
  - id: "4"
    content: "Documentar Foundation: crear sistema de espaciado (8pt grid) con ejemplos visuales"
    status: pending
  - id: "5"
    content: "Documentar Foundation: crear tokens de sombras, radius y transiciones con ejemplos"
    status: pending
  - id: "6"
    content: "Crear componentes Atoms: Button con todas las variantes (primary, secondary, danger, outline) y tamaños (sm, md, lg)"
    status: pending
  - id: "7"
    content: "Crear componentes Atoms: Input, Card, Badge, Chip, Tag, Checkbox, Radio, Select, Textarea con sus variantes y estados"
    status: pending
  - id: "8"
    content: "Crear componentes Atoms restantes: DatePicker, FileUpload, IconButton, Skeleton, Tooltip, Divider, Breadcrumb, EmptyState, FormField, Dropdown, StaffAvatar"
    status: pending
  - id: "9"
    content: "Crear componentes Molecules: StatCard, KPICard, ResidentCard, IncidentCard, StaffListItem, ResidentSelector, Tabs, Pagination, TimeScheduleSelector"
    status: pending
  - id: "10"
    content: "Crear componentes Organisms: Modal, Table, Calendar, Sidebar, MobileHeader, BottomNavigation"
    status: pending
  - id: "11"
    content: "Crear sección Patterns: documentar patrones comunes (formularios, dashboards, listas, calendarios) con ejemplos de uso en contexto de salud"
    status: pending
  - id: "12"
    content: "Aplicar optimizaciones para contexto de salud: mejorar contraste, legibilidad, y usabilidad en componentes críticos"
    status: pending
isProject: false
---

# Plan: Design System y Colección de Componentes en Pencil

## Objetivo

Crear un design system visual completo en Pencil que documente todos los design tokens y componentes de GeroCare, optimizado para el contexto de cuidado geriátrico con énfasis en legibilidad, accesibilidad y usabilidad.

## Estructura del Design System en Pencil

### 1. Frame Principal del Design System

Crear un documento `.pen` con la siguiente estructura:

```
Design System GeroCare
├── 1. Foundation (Tokens)
│   ├── Colors
│   │   ├── Primary Palette
│   │   ├── Neutral Grays
│   │   ├── Semantic Colors (Success, Error, Warning, Info)
│   │   └── Usage Examples
│   ├── Typography
│   │   ├── Font Scale (xs → 2xl)
│   │   ├── Font Weights
│   │   ├── Line Heights
│   │   └── Text Styles (Headings, Body, Caption)
│   ├── Spacing
│   │   └── 8pt Grid System (xs → 3xl)
│   ├── Shadows
│   │   └── Elevation System (sm, md, lg, xl)
│   ├── Radius
│   │   └── Border Radius Scale (sm → full)
│   └── Transitions
│       └── Animation Tokens
│
├── 2. Components - Atoms
│   ├── Button (variants: primary, secondary, danger, outline)
│   ├── Input
│   ├── Card (variants: default, outlined, elevated)
│   ├── Badge
│   ├── Chip
│   ├── Tag
│   ├── Checkbox
│   ├── Radio
│   ├── Select
│   ├── Textarea
│   ├── DatePicker
│   ├── FileUpload
│   ├── IconButton
│   ├── Skeleton
│   ├── Tooltip
│   ├── Divider
│   ├── Breadcrumb
│   ├── EmptyState
│   ├── FormField
│   ├── Dropdown
│   └── StaffAvatar
│
├── 3. Components - Molecules
│   ├── StatCard
│   ├── KPICard
│   ├── ResidentCard
│   ├── IncidentCard
│   ├── StaffListItem
│   ├── ResidentSelector
│   ├── Tabs
│   ├── Pagination
│   └── TimeScheduleSelector
│
├── 4. Components - Organisms
│   ├── Modal
│   ├── Table
│   ├── Calendar
│   ├── Sidebar
│   ├── MobileHeader
│   └── BottomNavigation
│
└── 5. Patterns & Examples
    ├── Form Patterns
    ├── Dashboard Layouts
    ├── Mobile Patterns
    └── Healthcare-Specific Patterns
```

## Consideraciones de Diseño para Contexto de Salud

### Colores
- **Primary**: Mantener el azul/púrpura actual (#667eea) pero asegurar contraste WCAG AA
- **Semantic Colors**: 
  - Success: Verde confiable para confirmaciones médicas
  - Error: Rojo claro pero no alarmante
  - Warning: Ámbar para alertas importantes
  - Info: Azul suave para información

### Tipografía
- Fuentes legibles y grandes (mínimo 14px para body)
- Alto contraste (WCAG AA mínimo)
- Jerarquía clara para información crítica

### Componentes Específicos de Salud
- **StatCard**: Mostrar métricas de salud de forma clara
- **ResidentCard**: Información accesible y rápida
- **MedicationSchedule**: Visualización clara de horarios
- **IncidentCard**: Alertas visibles pero no alarmantes

## Archivos a Crear/Modificar

1. **Nuevo archivo `.pen`**: `design-system-gerocare.pen` (o similar)
   - Contendrá todo el design system visual

2. **Componentes reutilizables en Pencil**:
   - Crear componentes reutilizables para cada atom/molecule/organism
   - Usar instancias para variantes (Button--primary, Button--secondary, etc.)

## Implementación Paso a Paso

### Fase 1: Foundation (Tokens)
1. Crear frame "Foundation"
2. Documentar paleta de colores completa con ejemplos de uso
3. Documentar escala tipográfica con ejemplos visuales
4. Documentar sistema de espaciado (8pt grid)
5. Documentar sombras, radius y transiciones

### Fase 2: Atoms
1. Crear frame "Atoms"
2. Para cada componente atom:
   - Crear componente reutilizable en Pencil
   - Documentar todas las variantes
   - Mostrar estados (default, hover, active, disabled, error)
   - Incluir especificaciones (padding, spacing, etc.)

### Fase 3: Molecules
1. Crear frame "Molecules"
2. Documentar cada molecule con:
   - Composición de atoms
   - Variantes y estados
   - Casos de uso específicos

### Fase 4: Organisms
1. Crear frame "Organisms"
2. Documentar componentes complejos con:
   - Estructura completa
   - Interacciones
   - Responsive behavior

### Fase 5: Patterns
1. Crear frame "Patterns"
2. Documentar patrones comunes:
   - Formularios de registro
   - Dashboards
   - Listas de residentes
   - Calendarios de turnos

## Especificaciones Técnicas

### Componentes Reutilizables
- Marcar cada componente como `reusable: true` en Pencil
- Usar instancias (`ref`) para variantes
- Organizar en frames por categoría

### Naming Convention
- Componentes: `DS-{Category}-{Name}` (ej: `DS-Atom-Button`, `DS-Molecule-StatCard`)
- Variantes: usar propiedades del componente
- Frames: `Foundation`, `Atoms`, `Molecules`, `Organisms`, `Patterns`

### Referencias de Código
- Cada componente debe incluir referencia al archivo Vue correspondiente
- Documentar props y eventos principales

## Mapeo Componentes Vue → Pencil

| Vue Component | Pencil Component | Variantes a Documentar |
|---------------|------------------|------------------------|
| `Button.vue` | `DS-Atom-Button` | primary, secondary, danger, outline + sizes (sm, md, lg) |
| `Input.vue` | `DS-Atom-Input` | default, error, disabled, with label |
| `Card.vue` | `DS-Atom-Card` | default, outlined, elevated + padding variants |
| `StatCard.vue` | `DS-Molecule-StatCard` | default, primary, success, warning, error |
| `Modal.vue` | `DS-Organism-Modal` | sizes, with/without footer |
| `Table.vue` | `DS-Organism-Table` | basic, with actions, sortable |

## Resultado Esperado

Un design system completo en Pencil que:
- Documente visualmente todos los tokens de diseño
- Muestre todos los componentes con sus variantes
- Sirva como referencia para diseño y desarrollo
- Facilite la comunicación entre diseño y desarrollo
- Esté optimizado para el contexto de cuidado geriátrico