# Plan Exhaustivo de Diseño, Usabilidad y Experiencia de Usuario - GeroCare

## Fecha de Creación: 2026-01-18

## Objetivo

Crear un marco de evaluación y mejora continua que cubra todas las dimensiones de diseño visual, usabilidad, accesibilidad y experiencia de usuario, específicamente adaptado al contexto de cuidadores geriátricos trabajando en entornos de alta presión.

---

## 1. Dimensiones de Evaluación (Qué Observar)

### 1.1. Usabilidad Funcional

**Aspectos clave:**
- **Tareas críticas**: ¿Pueden completarse sin ayuda?
- **Flujos principales**: ¿Son intuitivos y eficientes?
- **Eficiencia**: ¿Cuántos pasos y tiempo toma completar tareas?
- **Errores**: ¿Se previenen y se recuperan fácilmente?

**Flujos críticos a evaluar:**
- Onboarding y primer login
- Registro de medicación durante rondas
- Reporte de incidencias en tiempo real
- Búsqueda y acceso a información de residentes
- Visualización de turnos y horarios

### 1.2. Diseño Visual y Consistencia

**Aspectos clave:**
- **Jerarquía visual**: ¿La información importante destaca?
- **Consistencia**: ¿Componentes, espaciado, tipografía y colores son coherentes?
- **Sistema de diseño**: ¿Se usan tokens y componentes correctamente?
- **Estética**: ¿Es profesional, limpio y memorable?

**Elementos a revisar:**
- Uso consistente de design tokens (`src/assets/themes/tokens.css`, `semantic.css`)
- Espaciado siguiendo grid de 8pt
- Tipografía (escala, jerarquía, legibilidad)
- Paleta de colores (contraste, semántica, accesibilidad)
- Iconografía (Material Symbols, consistencia, significado)

### 1.3. Accesibilidad

**Aspectos clave:**
- **Contraste**: ¿Cumple WCAG AA (4.5:1) o AAA (7:1)?
- **Navegación por teclado**: ¿Toda funcionalidad es accesible sin mouse?
- **Lectores de pantalla**: ¿ARIA labels y roles son apropiados?
- **Tamaños táctiles**: ¿Botones y áreas clickeables son ≥ 44x44px en móvil?

**Checklist WCAG 2.1:**
- [ ] Contraste de texto cumple WCAG AA mínimo
- [ ] Navegación por teclado completa (Tab, Enter, Esc)
- [ ] Focus visible y claro
- [ ] ARIA labels en elementos interactivos
- [ ] Alt text en imágenes significativas
- [ ] Formularios tienen labels asociados
- [ ] Mensajes de error accionables y claros

### 1.4. Responsive y Adaptabilidad

**Aspectos clave:**
- **Móvil (< 768px)**: ¿Navegación táctil, inputs, y legibilidad son óptimos?
- **Tablet (768-1024px)**: ¿Layouts intermedios funcionan bien?
- **Desktop (> 1024px)**: ¿Aprovecha el espacio disponible eficientemente?
- **Breakpoints**: ¿Transiciones son fluidas?

**Breakpoints de GeroCare:**
- Móvil: < 768px (MobileHeader, BottomNavigation visibles)
- Tablet: 768px - 1024px
- Desktop: > 1024px (Sidebar visible)

### 1.5. Performance Percibida

**Aspectos clave:**
- **Tiempo de carga**: ¿Es aceptable (< 3 segundos)?
- **Feedback visual**: ¿Loading states, skeletons, progreso visible?
- **Transiciones**: ¿Suaves y naturales?
- **Animaciones**: ¿Ayudan o distraen?

**Estados a verificar:**
- Loading states (Skeleton components)
- Empty states (EmptyState component)
- Error states (mensajes claros)
- Success states (confirmación visual)

### 1.6. Contexto de Uso

**Consideraciones específicas de GeroCare:**
- **Uso móvil**: Cuidadores usan tablets/phones durante rondas
- **Entorno de presión**: Necesitan acceso rápido a información crítica
- **Precisión crítica**: Datos de salud requieren exactitud
- **Interrupciones frecuentes**: Flujos deben ser resumibles

---

## 2. Métodos de Evaluación

### 2.1. Evaluación Heurística (Heurísticas de Nielsen)

**10 Principios a evaluar:**

1. **Visibilidad del estado del sistema**: ¿El usuario sabe dónde está?
2. **Correspondencia entre sistema y mundo real**: ¿El lenguaje es familiar?
3. **Control y libertad del usuario**: ¿Pueden deshacer acciones?
4. **Consistencia y estándares**: ¿Sigue convenciones web?
5. **Prevención de errores**: ¿Previene errores antes de que ocurran?
6. **Reconocimiento antes que recuerdo**: ¿Opciones visibles vs memorizar?
7. **Flexibilidad y eficiencia de uso**: ¿Soporta usuarios novatos y expertos?
8. **Diseño estético y minimalista**: ¿Solo información relevante?
9. **Ayuda a reconocer, diagnosticar y recuperarse de errores**: ¿Mensajes claros?
10. **Ayuda y documentación**: ¿Hay ayuda cuando se necesita?

**Aplicación:** Una revisión heurística por módulo (Dashboard, Residentes, Medicación, etc.)

### 2.2. Pruebas de Usabilidad

**Tareas de prueba sugeridas:**
1. "Registra la administración de medicación para el residente [Nombre]"
2. "Reporta un incidente que ocurrió hace 30 minutos"
3. "Encuentra el horario de turnos de la próxima semana"
4. "Busca información de un residente específico"

**Métricas a capturar:**
- Tasa de éxito (porcentaje que completa tarea)
- Tiempo en tarea (segundos/minutos)
- Errores cometidos (número y tipo)
- Nivel de satisfacción (SUS - System Usability Scale)

**Participantes recomendados:**
- 5-8 cuidadores/nurses reales
- Mix de experiencia (novatos y expertos)
- Sesiones de 30-45 minutos

### 2.3. Análisis de Flujos Críticos

**Mapear cada flujo identificando:**
- Pasos necesarios
- Fricciones (puntos donde usuarios se detienen)
- Oportunidades de mejora
- Estados de error posibles

**Flujos prioritarios:**
1. Primer login → Dashboard
2. Registrar medicación → Confirmación
3. Reportar incidente → Documentación
4. Buscar residente → Ver perfil
5. Ver turnos del día → Cambiar vista

### 2.4. Auditoría de Diseño Visual

**Revisar:**
- Uso consistente de design tokens
- Espaciado siguiendo grid de 8pt
- Tipografía (escala, jerarquía)
- Color (paleta, contraste, semántica)
- Iconografía (familia, tamaño, significado)
- Componentes (variantes, estados)

**Herramientas:**
- Inspección manual de componentes
- Comparación con design system
- Verificación de tokens CSS

### 2.5. Auditoría de Accesibilidad

**Herramientas recomendadas:**
- Lighthouse (Chrome DevTools)
- axe DevTools
- WAVE (Web Accessibility Evaluation Tool)
- Contraste manual (WCAG Contrast Checker)

**Revisar:**
- Contraste de texto (WCAG AA/AAA)
- Navegación por teclado (tab order, focus visible)
- ARIA labels y roles
- Tamaños táctiles en móvil (≥ 44x44px)
- Alt text en imágenes

---

## 3. Áreas Específicas por Módulo

### 3.1. Dashboard (`src/business/dashboard/`)

**Componentes clave:**
- `DashboardPage.vue` - Página principal
- `StatCards.vue` - KPIs y métricas
- `QuickActions.vue` - Acciones rápidas
- `RecentActivity.vue` - Actividad reciente
- `MobileHeader.vue` - Header móvil
- `BottomNavigation.vue` - Navegación inferior

**Evaluar:**
- Visibilidad de información crítica (KPIs)
- Accesibilidad a acciones rápidas
- Funcionalidad de búsqueda global
- Visibilidad de "Staff on Duty" y "Recent Incidents"
- Empty states informativos
- Performance de carga de datos

**Checklist específico:**
- [ ] KPIs muestran información relevante al primer vistazo
- [ ] Acciones rápidas son evidentes y accesibles
- [ ] Búsqueda funciona correctamente (placeholder, icono visible)
- [ ] "Staff on Duty" se actualiza en tiempo real
- [ ] "Recent Incidents" prioriza por fecha/severidad
- [ ] Loading states claros (Skeleton components)
- [ ] Empty states informativos cuando no hay datos
- [ ] Responsive: funciona bien en móvil (< 768px)

**Archivos relevantes:**
- `src/business/dashboard/presentation/pages/DashboardPage.vue`
- `src/business/dashboard/presentation/components/StatCards.vue`
- `src/business/dashboard/app/useDashboard.ts`

### 3.2. Residentes (`src/business/residents/`)

**Componentes clave:**
- `ResidentsPage.vue` - Lista de residentes
- `ResidentList.vue` - Componente de lista
- `ResidentCard.vue` - Tarjeta individual
- `ResidentDetail.vue` - Vista de detalle
- `ResidentForm.vue` - Formulario creación/edición
- `ResidentSearch.vue` - Búsqueda

**Evaluar:**
- Escaneabilidad de lista
- Efectividad de búsqueda
- Organización de información en perfil
- Simplicidad de formularios
- Prevención de errores en entrada de datos

**Checklist específico:**
- [ ] Lista permite escanear rápidamente (cards bien diseñadas)
- [ ] Búsqueda encuentra residentes con pocos caracteres
- [ ] Perfil muestra información crítica de inmediato
- [ ] Formularios previenen errores de entrada (validación)
- [ ] Validación es clara y útil (mensajes específicos)
- [ ] Navegación entre listado y detalle es fluida

**Archivos relevantes:**
- `src/business/residents/presentation/pages/ResidentsPage.vue`
- `src/business/residents/presentation/components/ResidentCard.vue`
- `src/business/residents/presentation/components/ResidentDetail.vue`
- `src/business/residents/presentation/components/ResidentForm.vue`

### 3.3. Medicación (`src/business/medication/`)

**Componentes clave:**
- `MedicationPage.vue` - Página principal
- `MedicationSchedule.vue` - Vista de cronograma
- `MedicationForm.vue` - Formulario de registro
- `MedicationList.vue` - Lista de medicaciones

**Evaluar:**
- Claridad del cronograma
- Velocidad de registro
- Precisión en administración
- Visibilidad de alertas

**Checklist específico:**
- [ ] Vista de cronograma muestra horarios claramente
- [ ] Registro de administración toma < 30 segundos
- [ ] Confirmaciones previenen errores (doble check crítico)
- [ ] Historial es fácil de navegar
- [ ] Alertas de medicación pendiente son evidentes

**Archivos relevantes:**
- `src/business/medication/presentation/pages/MedicationPage.vue`
- `src/business/medication/presentation/components/MedicationSchedule.vue`
- `src/business/medication/presentation/components/MedicationForm.vue`

### 3.4. Incidencias (`src/business/incidents/`)

**Componentes clave:**
- `IncidentsPage.vue` - Página principal
- `IncidentList.vue` - Lista de incidencias
- `IncidentCard.vue` - Tarjeta individual (molecule)
- `IncidentForm.vue` - Formulario de reporte

**Evaluar:**
- Velocidad de reporte en situaciones de presión
- Complejidad vs rapidez del formulario
- Priorización en listado
- Accionabilidad de información

**Checklist específico:**
- [ ] Reporte de incidencia se completa en < 2 minutos
- [ ] Formulario captura información crítica sin ser abrumador
- [ ] Lista prioriza por severidad/fecha correctamente
- [ ] Estados son claros (pendiente, en revisión, resuelto)
- [ ] Filtros son útiles para encontrar incidencias

**Archivos relevantes:**
- `src/business/incidents/presentation/pages/IncidentsPage.vue`
- `src/business/incidents/presentation/components/IncidentList.vue`
- `src/business/common/presentation/molecules/IncidentCard.vue`
- `src/business/incidents/presentation/components/IncidentForm.vue`

### 3.5. Turnos (`src/business/shifts/`)

**Componentes clave:**
- `ShiftsPage.vue` - Página principal
- `ShiftList.vue` - Vista de lista/calendario
- `ShiftForm.vue` - Formulario de creación/edición

**Evaluar:**
- Claridad de vista de calendario
- Intuitividad de creación
- Flexibilidad de asignación
- Utilidad en desplazamiento

**Checklist específico:**
- [ ] Calendario muestra información relevante claramente
- [ ] Creación de turno es intuitiva (fecha, hora, staff)
- [ ] Cambios se reflejan inmediatamente
- [ ] Vista móvil muestra información crítica
- [ ] Notificaciones de cambios funcionan

**Archivos relevantes:**
- `src/business/shifts/presentation/pages/ShiftsPage.vue`
- `src/business/shifts/presentation/components/ShiftList.vue`
- `src/business/shifts/presentation/components/ShiftForm.vue`

### 3.6. Otros Módulos

**Planes de Atención (PAI) - `src/business/care-plans/`:**
- [ ] Formularios completos pero manejables
- [ ] Información organizada por categorías
- [ ] Edición fácil y segura

**Registro de Actividades - `src/business/activity-logs/`:**
- [ ] Registro rápido de actividades
- [ ] Categorización clara
- [ ] Historial navegable

**Reportes - `src/business/reports/`:**
- [ ] Generación de reportes intuitiva
- [ ] Filtros útiles
- [ ] Exportación funcional

---

## 4. Priorización: Qué Evaluar Primero

### Fase 1: Fundación (Semanas 1-2)

**Objetivo:** Establecer línea base y identificar problemas críticos

**Actividades:**
1. ✅ Auditoría visual del Dashboard (completar revisión de UI_EVALUATION.md)
2. Revisión heurística de flujos críticos (medicación, incidencias)
3. Auditoría de accesibilidad básica (Lighthouse, axe)
4. Revisión de consistencia de componentes (design tokens)

**Resultado esperado:**
- Lista priorizada de problemas visuales y de usabilidad críticos
- Documento de hallazgos iniciales
- Plan de acción inmediato

### Fase 2: Flujos Críticos (Semanas 3-4)

**Objetivo:** Mejorar los flujos más importantes para usuarios

**Actividades:**
1. Mapeo detallado de flujos críticos (medicación, incidencias)
2. Pruebas de usabilidad con 3-5 usuarios reales
3. Análisis de fricciones y puntos de dolor
4. Propuestas de mejora priorizadas

**Resultado esperado:**
- Mapa de flujos actuales
- Reporte de pruebas de usabilidad
- Lista priorizada de mejoras

### Fase 3: Refinamiento (Semanas 5-6)

**Objetivo:** Pulir la experiencia y mejorar percepción de calidad

**Actividades:**
1. Mejoras visuales y de interacción
2. Optimización de performance percibida (loading, skeletons)
3. Estados vacíos y error states
4. Micro-interacciones y animaciones sutiles

**Resultado esperado:**
- Mejoras implementadas
- Métricas de impacto
- Documentación de cambios

### Fase 4: Validación Continua (Ongoing)

**Objetivo:** Mantener calidad a largo plazo

**Actividades:**
1. Pruebas de usabilidad regulares (cada sprint)
2. Métricas de uso (analytics)
3. Feedback continuo de usuarios
4. Iteración basada en datos

**Resultado esperado:**
- Proceso establecido de validación
- Métricas de tendencias
- Mejora continua documentada

---

## 5. Checklist Rápido por Página/Módulo

### Checklist Universal (Aplicable a Todas las Páginas)

**Accesibilidad:**
- [ ] Contraste de texto cumple WCAG AA (4.5:1 mínimo)
- [ ] Navegación por teclado funciona (Tab, Enter, Esc)
- [ ] Focus visible es claro y accesible
- [ ] ARIA labels presentes en elementos interactivos
- [ ] Formularios tienen labels asociados
- [ ] Mensajes de error son claros y accionables

**Estados:**
- [ ] Loading states presentes (skeletons o spinners)
- [ ] Empty states informativos y útiles
- [ ] Error states claros con acciones sugeridas
- [ ] Success states con confirmación visual

**Responsive:**
- [ ] Funciona correctamente en móvil (< 768px)
- [ ] Funciona correctamente en tablet (768-1024px)
- [ ] Funciona correctamente en desktop (> 1024px)
- [ ] Transiciones fluidas entre breakpoints

**Componentes:**
- [ ] Iconos tienen significado claro
- [ ] Botones táctiles ≥ 44x44px en móvil
- [ ] Links distinguibles del texto normal
- [ ] Formularios validan antes de submit

### Checklist Móvil Específico

**Navegación:**
- [ ] BottomNavigation visible y funcional (< 768px)
- [ ] MobileHeader visible y funcional (< 768px)
- [ ] Menú hamburguesa funciona correctamente

**Interacción:**
- [ ] Inputs fáciles de usar con una mano
- [ ] Botones accesibles sin zoom
- [ ] Información crítica visible sin scroll excesivo
- [ ] Teclados virtuales no cubren inputs

**Performance:**
- [ ] Carga rápida en conexiones 3G/4G
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado donde aplica

---

## 6. Métricas y KPIs de UX

### Métricas de Uso

**Eficiencia:**
- Tiempo promedio en completar tareas críticas
- Número de clicks/pasos para completar tarea
- Tasa de error en formularios

**Efectividad:**
- Tasa de éxito en completar tareas
- Búsquedas sin resultados (dead ends)
- Tareas abandonadas (drop-off rate)

### Métricas de Satisfacción

**Percepción:**
- System Usability Scale (SUS) después de pruebas
- Net Promoter Score (NPS) interno
- Feedback cualitativo de usuarios

**Emocional:**
- Frustraciones reportadas
- Momentos de "wow" identificados
- Sentimiento general hacia la aplicación

### Métricas Técnicas

**Performance:**
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Lighthouse Score (Performance)

**Accesibilidad:**
- Lighthouse Score (Accessibility)
- Número de issues de axe
- WCAG compliance level (A, AA, AAA)

---

## 7. Plan de Acción Inmediato

### Esta Semana

1. **Completar auditoría visual del Dashboard**
   - Revisar estado actual según `UI_EVALUATION.md`
   - Verificar correcciones implementadas
   - Identificar nuevos problemas

2. **Crear checklist de evaluación por módulo**
   - Adaptar checklist universal a cada módulo
   - Documentar específicamente para Dashboard, Residentes, Medicación

3. **Revisión heurística inicial**
   - Aplicar 10 principios de Nielsen al Dashboard
   - Documentar hallazgos

4. **Auditoría de accesibilidad básica**
   - Ejecutar Lighthouse en Dashboard
   - Ejecutar axe DevTools
   - Documentar issues encontrados

### Próximas 2 Semanas

1. **Mapeo de flujos críticos**
   - Registrar medicación (start → confirm)
   - Reportar incidente (start → document)
   - Buscar residente (search → detail)

2. **Análisis de fricciones**
   - Identificar puntos de dolor
   - Priorizar por impacto/effort

3. **Propuestas de mejora**
   - Soluciones específicas para cada fricción
   - Wireframes/mockups si necesario

4. **Preparación para pruebas de usabilidad**
   - Definir tareas de prueba
   - Crear guión de prueba
   - Reclutar participantes

### Próximo Mes

1. **Implementar mejoras prioritarias**
   - Corregir problemas críticos identificados
   - Mejorar flujos con mayor fricción

2. **Realizar pruebas de usabilidad**
   - 3-5 sesiones con usuarios reales
   - Capturar métricas y observaciones

3. **Medir impacto de cambios**
   - Comparar métricas antes/después
   - Recopilar feedback de usuarios

4. **Iterar basado en feedback**
   - Priorizar mejoras adicionales
   - Planificar siguiente ciclo

---

## 8. Recursos y Herramientas

### Herramientas Recomendadas

**Evaluación Visual:**
- Figma (para comparar con mockups si existen)
- Chrome DevTools (inspección de estilos)

**Usabilidad:**
- Maze (para pruebas remotas asíncronas)
- UserTesting (para pruebas con usuarios reales)
- Sesiones internas de prueba (más rápido, menos costoso)

**Accesibilidad:**
- Lighthouse (Chrome DevTools)
- axe DevTools (extensión de navegador)
- WAVE (Web Accessibility Evaluation Tool)
- WCAG Contrast Checker (para verificar contraste)

**Analytics (si se implementa):**
- Firebase Analytics
- Google Analytics
- Hotjar (heatmaps y session recordings)

**Feedback:**
- Surveys in-app
- Entrevistas con usuarios
- Feedback interno del equipo

### Documentación

**Almacenar en:**
- Decisiones de diseño: `docs/design-decisions.md` (crear si no existe)
- Resultados de investigación: `docs/research/` (crear si no existe)
- Guía de componentes: Storybook (cuando esté disponible)

**Formato de documentación:**
- Hallazgos: Problema → Evidencia → Impacto → Solución propuesta
- Métricas: Antes → Después → Análisis
- Decisiones: Contexto → Opciones → Decisión → Razón

---

## 9. Integración con Skills Existentes

### Relación con `ux-researcher-designer`

Este plan complementa la skill `ux-researcher-designer` con:
- **Metodologías específicas** de evaluación de UI/UX
- **Checklists concretos** para cada módulo
- **Métricas cuantificables** de calidad UX

**Uso combinado:**
1. Generar personas con `ux-researcher-designer` → Definir usuarios objetivo
2. Usar este plan → Evaluar experiencia actual para esas personas
3. Mapear journey con `ux-researcher-designer` → Identificar puntos de mejora
4. Usar este plan → Validar mejoras con métricas

### Relación con `ui-design-system`

Este plan valida que el sistema de diseño se usa correctamente:
- **Uso de tokens**: Verificar que componentes usan tokens semánticos
- **Consistencia**: Validar que no hay desviaciones del design system
- **Completitud**: Identificar gaps en el sistema de diseño

### Relación con `ui-components`

Este plan verifica la implementación de componentes:
- **Estados**: Loading, empty, error, success
- **Accesibilidad**: ARIA, keyboard navigation, focus
- **Responsive**: Comportamiento en diferentes breakpoints
- **Variantes**: Uso correcto de props y variantes

---

## 10. Próximos Pasos Inmediatos

### Checklist de Inicio

- [ ] Revisar este documento completo
- [ ] Asignar responsable de evaluación (si aplica)
- [ ] Ejecutar Fase 1 (auditorías iniciales)
- [ ] Documentar hallazgos en `docs/UX_FINDINGS.md`
- [ ] Priorizar problemas identificados
- [ ] Crear tickets/issues para mejoras prioritarias

### Documentos Relacionados

- `UI_EVALUATION.md` - Evaluación técnica inicial del Dashboard
- `.cursor/skills/ux-researcher-designer/SKILL.md` - Skill de investigación UX
- `.cursor/skills/ui-design-system/SKILL.md` - Skill de design system
- `.cursor/skills/ui-components/SKILL.md` - Skill de componentes UI

---

**Última actualización:** 2026-01-18
**Mantenedor:** Equipo de desarrollo GeroCare
**Versión:** 1.0