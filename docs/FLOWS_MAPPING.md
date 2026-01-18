# Mapeo de Flujos Críticos - GeroCare

## Fecha de Creación: 2026-01-18

## Objetivo

Documentar los flujos críticos de usuario en GeroCare, identificar fricciones, puntos de dolor, y oportunidades de mejora para optimizar la experiencia de usuario.

---

## Flujo 1: Registrar Medicación

### Descripción

Flujo para que un cuidador registre una nueva medicación para un residente. Este es uno de los flujos más frecuentes durante las rondas diarias.

### Paso a Paso

```
1. Usuario accede a página de medicación
   ├─ Desde Dashboard → Click en "Medicación" en navegación
   ├─ Desde perfil de residente → Tab "Medicación"
   └─ URL: /medication o /residents/:id (tab medicación)

2. Usuario hace click en "Nueva Medicación"
   └─ Abre modal con formulario

3. Usuario completa formulario:
   ├─ Residente ID (si no viene de props)
   ├─ Nombre del Medicamento (requerido)
   ├─ Dosis (requerido)
   ├─ Frecuencia (requerido) - ej: "8:00, 14:00, 20:00"
   ├─ Fecha de Inicio (requerido)
   ├─ Fecha de Fin (opcional)
   └─ Instrucciones (opcional)

4. Usuario hace click en "Guardar"
   ├─ Validación en cliente (isFormValid)
   ├─ Validación con Zod (MedicationCreateSchema)
   └─ Si válido → Submit a store → Cierra modal

5. Confirmación
   └─ Notificación de éxito → Modal se cierra → Lista se actualiza
```

### Puntos de Decisión

1. **Residente ID desde props vs manual**
   - **Desde props**: Campo oculto, usuario no ve ni edita
   - **Manual**: Usuario debe escribir ID (fricción potencial)

2. **Fecha de Fin opcional**
   - Usuario puede dejar vacío para medicación continua
   - Validación `min` previene fechas anteriores a inicio

3. **Validación**
   - Si `isFormValid` es false → Botón deshabilitado
   - Si validación Zod falla → Muestra primer error
   - Si submit falla → Muestra error del store

### Fricciones Identificadas

1. **Frecuencia como texto libre** (Alta)
   - **Problema**: Usuario puede escribir "8:00, 14:00, 20:00" o "diario" o "dos veces al día"
   - **Impacto**: Inconsistencias en formato, difícil de parsear, errores de entrada
   - **Oportunidad**: Selector de horarios múltiples o validación con formato específico

2. **Residente ID manual** (Media)
   - **Problema**: Si no viene de props, usuario debe escribir ID manualmente
   - **Impacto**: Errores de entrada, requiere conocimiento de IDs
   - **Oportunidad**: Selector de residentes con búsqueda

3. **Validación solo al submit** (Media)
   - **Problema**: Usuario completa todo el formulario y descubre errores solo al enviar
   - **Impacto**: Frustración, pérdida de tiempo
   - **Oportunidad**: Validación en tiempo real (on blur o mientras escribe)

4. **Mensajes de error genéricos** (Baja)
   - **Problema**: "Please fill in all required fields" no indica qué campo falta
   - **Impacto**: Usuario debe revisar todos los campos
   - **Oportunidad**: Mensajes específicos por campo

5. **Sin confirmación visual antes de cerrar** (Baja)
   - **Problema**: Modal se cierra inmediatamente después de submit exitoso
   - **Impacto**: Puede confundir si el guardado fue exitoso
   - **Oportunidad**: Mensaje de confirmación visible antes de cerrar (delay de 1-2 segundos)

### Estados de Error

- **Error de validación Zod**: Muestra primer error del schema
- **Error de submit**: Muestra `medicationStore.error?.message` o mensaje genérico
- **Error de conexión**: Mensaje específico "verifique su conexión"
- **Usuario no autenticado**: `authStore.user` debe estar presente (validado en `submit`)

### Oportunidades de Mejora Priorizadas

| Prioridad | Mejora | Impacto | Effort | Recomendación |
|-----------|--------|---------|--------|---------------|
| Alta | Selector de residentes con búsqueda | Alto | Media | Reemplazar input de Residente ID con componente de búsqueda |
| Alta | Selector de horarios para frecuencia | Alto | Media | Reemplazar input libre con selector múltiple de horarios |
| Media | Validación en tiempo real | Medio | Media | Añadir validación on blur o mientras escribe |
| Media | Mensajes de error específicos | Medio | Baja | Mejorar mensajes para indicar campos faltantes específicamente |
| Baja | Confirmación visual antes de cerrar | Bajo | Baja | Añadir delay de 1-2 segundos antes de cerrar modal |

---

## Flujo 2: Reportar Incidencia

### Descripción

Flujo para que un cuidador reporte un incidente ocurrido con un residente. Este flujo debe ser rápido y eficiente ya que típicamente ocurre en situaciones de presión.

### Paso a Paso

```
1. Usuario accede a página de incidencias
   ├─ Desde Dashboard → Click en "Incidencias" en navegación
   ├─ Desde perfil de residente → Tab "Incidencias"
   └─ URL: /incidents o /residents/:residentId (tab incidencias)

2. Usuario hace click en "Registrar Incidencia"
   └─ Abre modal con formulario

3. Usuario completa formulario:
   ├─ Residente ID (si no viene de props)
   ├─ Tipo de Incidencia (requerido) - Select: Caída, Lesión, Error de Medicación, etc.
   ├─ Severidad (requerido) - Select: Baja, Media, Alta, Crítica
   ├─ Descripción (requerido) - Textarea
   ├─ Ubicación (opcional)
   └─ Fecha y Hora del Incidente (requerido)

4. Usuario hace click en "Registrar"
   ├─ Validación en cliente (isFormValid)
   ├─ Validación con Zod (IncidentCreateSchema)
   └─ Si válido → Submit a store → Cierra modal

5. Confirmación
   └─ Notificación de éxito → Modal se cierra → Lista se actualiza
```

### Puntos de Decisión

1. **Tipo de Incidencia**
   - Select predefinido evita errores de entrada
   - Valor por defecto: "other"

2. **Severidad**
   - Select predefinido (Baja, Media, Alta, Crítica)
   - Valor por defecto: "medium"
   - Impacto en priorización y alertas

3. **Fecha y Hora del Incidente**
   - `DatePicker` solo maneja fecha
   - `incidentDate` es `Date` (incluye hora si se establece), pero UI solo muestra fecha
   - Para incidentes críticos, hora específica puede ser importante

### Fricciones Identificadas

1. **Descripción larga requerida** (Alta)
   - **Problema**: Campo de descripción es requerido y puede ser tedioso en situaciones de presión
   - **Impacto**: Demora en reportar incidentes, posible abandono del formulario
   - **Oportunidad**: Plantillas de descripción por tipo, o hacer campo opcional para incidentes no críticos

2. **Fecha/hora combinada** (Media)
   - **Problema**: `DatePicker` solo muestra fecha, no hora específica. Para incidentes críticos, hora exacta puede ser crucial
   - **Impacto**: Pérdida de precisión temporal
   - **Oportunidad**: Añadir selector de hora o usar timestamp automático si es "ahora"

3. **Sin campos adicionales urgentes** (Media)
   - **Problema**: Para incidentes críticos, no hay campo de "Acción inmediata tomada" o "Contactar supervisor"
   - **Impacto**: Información crítica puede quedar fuera del reporte inicial
   - **Oportunidad**: Añadir campos condicionales según severidad (ej: si severidad = "crítica", mostrar campo adicional)

4. **Validación solo al submit** (Media)
   - **Problema**: Mismo problema que medicación - validación solo al enviar
   - **Impacto**: Descubrir errores tarde, especialmente frustrante en situaciones de presión
   - **Oportunidad**: Validación en tiempo real

5. **Residente ID manual** (Media)
   - **Problema**: Mismo problema que medicación - entrada manual de ID si no viene de props
   - **Impacto**: Errores de entrada, pérdida de tiempo
   - **Oportunidad**: Selector de residentes con búsqueda

### Estados de Error

- **Error de validación Zod**: Muestra primer error del schema
- **Error de submit**: Muestra `incidentStore.error?.message` o mensaje genérico
- **Error de conexión**: Mensaje específico "verifique su conexión"
- **Usuario no autenticado**: `authStore.user` debe estar presente (validado en `submit`)

### Oportunidades de Mejora Priorizadas

| Prioridad | Mejora | Impacto | Effort | Recomendación |
|-----------|--------|---------|--------|---------------|
| Alta | Selector de residentes con búsqueda | Alto | Media | Reemplazar input de Residente ID con componente de búsqueda |
| Alta | Plantillas de descripción por tipo | Alto | Media | Añadir botón "Usar plantilla" con descripciones predefinidas |
| Media | Selector de hora para fecha/hora | Medio | Media | Añadir selector de hora junto a DatePicker, o timestamp automático |
| Media | Campos condicionales por severidad | Medio | Media | Si severidad = "crítica", mostrar campos adicionales (acciones tomadas, contactos) |
| Media | Validación en tiempo real | Medio | Media | Añadir validación on blur |
| Baja | Mensajes de error específicos | Bajo | Baja | Mejorar mensajes para indicar campos faltantes |

---

## Análisis Comparativo de Flujos

### Similitudes

- Ambos usan el mismo patrón de modal + formulario
- Validación similar (cliente + Zod)
- Manejo de errores similar
- Mismo problema de Residente ID manual

### Diferencias

- **Incidencias usa Selects**: Tipo y Severidad usan `Select` en lugar de `Input` libre, reduciendo errores
- **Medicación tiene más campos opcionales**: Instrucciones, Fecha de Fin son opcionales
- **Incidencias tiene campo crítico**: Descripción es requerida y puede ser largo

### Lecciones Aprendidas

1. **Selects son mejores que inputs libres**: El uso de `Select` en incidencias (Tipo, Severidad) es mejor UX que input libre en medicación (Frecuencia)
2. **Validación en tiempo real necesaria**: Ambos flujos se beneficiarían de validación mientras se escribe
3. **Selectores de entidades**: Ambos flujos necesitan selector de residentes en lugar de ID manual
4. **Mensajes de error específicos**: Mejorar mensajes para indicar campos faltantes específicamente

---

## Mapa de Flujos Visual (Texto)

### Flujo de Medicación

```
Dashboard/Resident Page
    ↓
Medication Page
    ↓
Click "Nueva Medicación"
    ↓
Modal Opens
    ↓
Fill Form:
  - Residente ID [manual if not from props]
  - Nombre [required]
  - Dosis [required]
  - Frecuencia [required, text free] ← FRICCIÓN
  - Fecha Inicio [required]
  - Fecha Fin [optional]
  - Instrucciones [optional]
    ↓
Click "Guardar"
    ↓
Validation (isFormValid + Zod)
    ↓
[Error?] → Show Error Message
    ↓
[Success?] → Show Success → Close Modal → Update List
```

### Flujo de Incidencias

```
Dashboard/Resident Page
    ↓
Incidents Page
    ↓
Click "Registrar Incidencia"
    ↓
Modal Opens
    ↓
Fill Form:
  - Residente ID [manual if not from props] ← FRICCIÓN
  - Tipo [required, Select] ✅
  - Severidad [required, Select] ✅
  - Descripción [required, long text] ← FRICCIÓN
  - Ubicación [optional]
  - Fecha/Hora [required, DatePicker only] ← FRICCIÓN
    ↓
Click "Registrar"
    ↓
Validation (isFormValid + Zod)
    ↓
[Error?] → Show Error Message
    ↓
[Success?] → Show Success → Close Modal → Update List
```

---

## Recomendaciones Prioritizadas

### Quick Wins (Alto Impacto, Baja Effort)

1. **Mejorar mensajes de error** - Mostrar campo específico faltante
2. **Confirmación visual antes de cerrar** - Delay de 1-2 segundos

### Mejoras Medias (Alto Impacto, Media Effort)

3. **Selector de residentes** - Reemplazar input de ID con componente de búsqueda
4. **Selector de horarios** - Reemplazar input libre de frecuencia con selector múltiple
5. **Plantillas de descripción** - Añadir plantillas por tipo de incidencia
6. **Selector de hora** - Añadir selector de hora para fecha/hora de incidente

### Mejoras Futuras (Medio-Alto Impacto, Alta Effort)

7. **Validación en tiempo real** - Validación mientras se escribe o on blur
8. **Campos condicionales** - Mostrar campos adicionales según severidad (incidencias críticas)
9. **Modo rápido** - Para incidencias, modo simplificado con menos campos

---

## Métricas Objetivo

### Tiempo de Completar

- **Medicación**: Objetivo < 60 segundos (actual: estimado 90-120 segundos con ID manual)
- **Incidencia**: Objetivo < 90 segundos (actual: estimado 120-180 segundos con descripción larga)

### Tasa de Error

- **Errores de validación**: Objetivo < 5% de submits
- **Errores de Residente ID**: Objetivo 0% (eliminado con selector)

### Satisfacción

- **SUS Score**: Objetivo > 80 después de mejoras
- **Frustración reportada**: Reducir fricciones identificadas

---

**Última actualización**: 2026-01-18
**Próxima revisión**: Después de implementar mejoras prioritarias
