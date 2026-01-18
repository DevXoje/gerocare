# Guía de Estilo de Código - GeroCare

Esta guía documenta las decisiones de estilo de código para GeroCare. Sigue estas convenciones para mantener consistencia en todo el proyecto.

---

## Tabla de Contenidos

1. [Formato y Configuración](#formato-y-configuración)
2. [Ternarias vs If/Else](#ternarias-vs-ifelse)
3. [Parámetros de Funciones](#parámetros-de-funciones)
4. [Convenciones de Nombres](#convenciones-de-nombres)
5. [Imports y Organización](#imports-y-organización)
6. [Async/Await y Manejo de Errores](#asyncawait-y-manejo-de-errores)
7. [TypeScript](#typescript)
8. [Componentes Vue](#componentes-vue)
9. [Comentarios](#comentarios)
10. [Result Type Pattern](#result-type-pattern)
11. [Espaciado y Formato](#espaciado-y-formato)

---

## Formato y Configuración

### Prettier

Configuración en `.prettierrc.json`:

- **Sin semicolons**: No usar punto y coma al final de líneas
- **Comillas simples**: Usar `'` en lugar de `"`
- **Ancho máximo**: 100 caracteres por línea
- **Formato automático**: Ejecutar `npm run format` antes de commitear

```typescript
// ✅ Correcto
const name = 'GeroCare'
const greeting = `Hello, ${name}`

// ❌ Incorrecto
const name = "GeroCare";
const greeting = `Hello, ${name}`;
```

### EditorConfig

Configuración en `.editorconfig`:

- **Indentación**: 2 espacios (no tabs)
- **Charset**: UTF-8
- **Fin de línea**: LF (Unix)
- **Insertar nueva línea al final**: Sí
- **Eliminar espacios en blanco al final**: Sí

### ESLint

Reglas importantes configuradas en `eslint.config.ts`:

- **Prohibir imports relativos** en `src/`: Usar alias `@/` en lugar de `../` o `./`
- **Orden de imports**: Automático con `simple-import-sort`
- **Permitir imports relativos** solo en tests y archivos de configuración

```typescript
// ✅ Correcto - Usar alias
import { useAuthStore } from '@/business/auth/store'
import type { Resident } from '@/business/residents/domain/Resident'

// ❌ Incorrecto - Imports relativos en src/
import { useAuthStore } from '../../auth/store'
import type { Resident } from '../domain/Resident'
```

---

## Ternarias vs If/Else

### Usar Ternarias Para:

1. **Expresiones simples en return/assignment**
2. **Valores condicionales en una sola línea**
3. **Casos simples con 2 opciones**

```typescript
// ✅ Correcto - Expresión simple
const status = isLoading ? 'loading' : 'ready'

// ✅ Correcto - Return condicional
return isActive ? user.name : 'Anonymous'

// ✅ Correcto - Ternaria anidada (hasta 2-3 niveles con buen formato)
const result = residentId
  ? activeOnly
    ? await repository.findActiveByResident(residentId)
    : await repository.findByResident(residentId)
  : await repository.findAll()
```

### Usar If/Else Para:

1. **Lógica multi-línea**
2. **Efectos secundarios** (múltiples asignaciones, llamadas a funciones)
3. **Casos complejos con múltiples condiciones**
4. **Early returns**

```typescript
// ✅ Correcto - Lógica multi-línea
if (result.success) {
  carePlans.value = result.value
  isLoading.value = false
  error.value = null
} else {
  error.value = result.error
  carePlans.value = []
}

// ✅ Correcto - Early return
if (!authStore.user) {
  error.value = { code: 'AUTH_ERROR', message: 'User not authenticated' }
  return
}

// ✅ Correcto - Múltiples condiciones
if (carePlanId) {
  result = await repository.getActivityHistory(carePlanId)
} else if (residentId) {
  result = await repository.getResidentActivityHistory(residentId)
} else {
  result = { success: false, error: { code: 'INVALID_PARAMS', message: 'Required param missing' } }
}
```

### Reglas de Ternarias Anidadas

- **Permitidas hasta 2-3 niveles** con buen formato (indentación clara)
- **Evitar más de 3 niveles** - usar if/else en su lugar
- **Siempre alinear operadores** `?` y `:` para legibilidad

```typescript
// ✅ Correcto - Ternaria anidada bien formateada
const value = condition1
  ? condition2
    ? 'value1'
    : 'value2'
  : 'value3'

// ❌ Incorrecto - Demasiado anidada
const value = a ? b ? c ? d : e : f : g
```

---

## Parámetros de Funciones

### Formato Inline (1-2 parámetros simples)

```typescript
// ✅ Correcto - Parámetros simples inline
async function fetchCarePlan(id: string) {
  // ...
}

function loadResidents(authStore: AuthStore) {
  // ...
}
```

### Formato Multilínea (3+ parámetros o tipos complejos)

```typescript
// ✅ Correcto - Múltiples parámetros multilínea
async function updateCarePlan(
  id: string,
  updates: Partial<Omit<CarePlan, 'id' | 'createdAt'>>,
  options?: UpdateOptions
) {
  // ...
}

// ✅ Correcto - Tipo complejo multilínea
async function createCarePlan(
  carePlan: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>
) {
  // ...
}
```

### Parámetros Opcionales

```typescript
// ✅ Correcto - Parámetro opcional con `?`
async function fetchCarePlans(residentId?: string, activeOnly?: boolean) {
  // ...
}

// ✅ Correcto - Parámetro con valor por defecto
function recordActivity(
  carePlanId: string,
  residentId: string,
  activityDate: Date,
  notes?: string,
  status: 'completed' | 'skipped' = 'completed'
) {
  // ...
}
```

### Tipos en Parámetros

- **Inline** cuando el tipo es claro y corto
- **Separado** cuando el tipo es complejo (usa `type` alias)

```typescript
// ✅ Correcto - Tipo inline claro
function validateResident(resident: Resident): Result<Resident, ResidentError> {
  // ...
}

// ✅ Correcto - Tipo complejo separado
type CreateCarePlanInput = Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>

async function createCarePlan(carePlan: CreateCarePlanInput) {
  // ...
}
```

---

## Convenciones de Nombres

### Archivos

- **Componentes Vue**: PascalCase - `ResidentForm.vue`, `Button.vue`
- **TypeScript**: camelCase - `useResidents.ts`, `store.ts`
- **Tests**: camelCase con `.spec.ts` o `.test.ts` - `Resident.spec.ts`
- **Schemas Zod**: camelCase con `.schema.ts` - `Resident.schema.ts`

### Funciones

- **camelCase**: `loadResidents`, `fetchCarePlan`, `createResident`
- **Verbos descriptivos**: Prefijos como `load`, `fetch`, `create`, `update`, `delete`

```typescript
// ✅ Correcto
const loadResidents = async () => { }
const fetchCarePlan = async (id: string) => { }
const createResident = async (data: ResidentData) => { }

// ❌ Incorrecto
const getResidents = async () => { } // Preferir "load" o "fetch"
const resident = async (id: string) => { } // No es descriptivo
```

### Variables

- **camelCase**: `isLoading`, `carePlans`, `currentCarePlan`
- **Booleanos**: Prefijo `is`, `has`, `should` - `isLoading`, `hasError`, `shouldValidate`
- **Arrays**: Plural - `residents`, `carePlans`, `activities`

```typescript
// ✅ Correcto
const isLoading = ref(false)
const carePlans = ref<CarePlan[]>([])
const hasError = computed(() => error.value !== null)

// ❌ Incorrecto
const loading = ref(false) // Usar "isLoading"
const carePlan = ref<CarePlan[]>([]) // Arrays deben ser plural
```

### Tipos e Interfaces

- **PascalCase**: `CarePlan`, `ResidentError`, `ActivityLog`
- **Interfaces**: Sin prefijo `I` - `Resident` no `IResident`
- **Types utilitarios**: PascalCase con sufijo - `CreateCarePlanInput`, `ResidentFormData`

```typescript
// ✅ Correcto
interface CarePlan { }
interface ResidentError { }
type CreateCarePlanInput = Omit<CarePlan, 'id'>

// ❌ Incorrecto
interface ICarePlan { } // No usar prefijo I
type createCarePlanInput = {} // Debe ser PascalCase
```

### Constantes

- **UPPER_SNAKE_CASE**: Solo para constantes globales o configuración
- **camelCase**: Para constantes locales o en funciones

```typescript
// ✅ Correcto - Constante global
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRIES = 3

// ✅ Correcto - Constante local
const repository = createResidentRepository()
const defaultStatus = 'active'
```

---

## Imports y Organización

### Orden de Imports (ESLint auto-sort)

1. **Side effect imports** (`import 'something'`)
2. **Node.js builtins** (`import fs from 'node:fs'`)
3. **Packages externos** (`import { ref } from 'vue'`)
4. **Aliases internos** (`import { useAuthStore } from '@/business/auth/store'`)
5. **Parent imports** (`import { something } from '../domain'`)
6. **Current directory** (`import { helper } from './utils'`)
7. **Styles** (`import './styles.css'`)

### Agrupar Imports

Agrupar imports con líneas en blanco:

```typescript
// ✅ Correcto - Agrupado por tipo
import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Resident } from '@/business/residents/domain/Resident'
import { createResidentRepository } from '@/business/residents/infrastructure'

// Vue core primero, luego aliases @/, luego tipos
```

### Imports de Tipos

Usar `import type` para imports que solo se usan como tipos:

```typescript
// ✅ Correcto - Separar imports de tipos
import { useAuthStore } from '@/business/auth/store'
import type { Resident } from '@/business/residents/domain/Resident'
import type { ResidentError } from '@/business/residents/domain/ResidentErrors'

// Tipos en línea separada después de imports de valores
```

---

## Async/Await y Manejo de Errores

### Preferir Async/Await

Usar `async/await` en lugar de `.then()` y `.catch()`:

```typescript
// ✅ Correcto - async/await
async function loadResidents() {
  isLoading.value = true
  try {
    const result = await repository.findAll()
    if (result.success) {
      residents.value = result.value
    }
  } catch {
    error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load residents' }
  } finally {
    isLoading.value = false
  }
}

// ❌ Incorrecto - Promesas con .then()
function loadResidents() {
  isLoading.value = true
  repository.findAll()
    .then(result => {
      if (result.success) {
        residents.value = result.value
      }
    })
    .catch(() => {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load residents' }
    })
    .finally(() => {
      isLoading.value = false
    })
}
```

### Patrón Try-Catch-Finally

Siempre usar try-catch-finally para operaciones async:

```typescript
// ✅ Correcto - Patrón estándar
async function fetchCarePlan(id: string) {
  isLoading.value = true
  error.value = null

  try {
    const result = await repository.findById(id)
    if (result.success) {
      currentCarePlan.value = result.value
    } else {
      error.value = result.error
    }
  } catch {
    error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to fetch care plan' }
  } finally {
    isLoading.value = false
  }
}
```

### Result Type Pattern

Usar `Result<T, E>` en repositorios para manejo explícito de errores:

```typescript
// ✅ Correcto - Usar Result types
async function findById(id: string): Promise<Result<CarePlan | null, CarePlanError>> {
  try {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return Ok(null)
    }

    const carePlan = firestoreDocToCarePlan(docSnap.id, docSnap.data())
    return Ok(carePlan)
  } catch (error) {
    return Err(createUnknownCarePlanError('Failed to find care plan'))
  }
}

// Usar en composables
const result = await repository.findById(id)
if (result.success) {
  // Handle success: result.value
} else {
  // Handle error: result.error
}
```

---

## TypeScript

### Tipos Explícitos

- **Parámetros de funciones públicas**: Siempre tipos explícitos
- **Retorno de funciones públicas**: Tipos explícitos cuando no son obvios
- **Variables locales**: Usar inferencia cuando el tipo es obvio

```typescript
// ✅ Correcto - Tipos explícitos en parámetros
async function fetchCarePlan(id: string): Promise<void> {
  // ...
}

// ✅ Correcto - Inferencia en variables locales
const residents = ref<Resident[]>([]) // Tipo explícito necesario
const count = residents.value.length // Inferencia OK

// ❌ Incorrecto - Sin tipos en parámetros
async function fetchCarePlan(id) { // Debe ser: id: string
  // ...
}
```

### Tipos Utilitarios

Usar `Omit`, `Partial`, `Pick` para manipular tipos:

```typescript
// ✅ Correcto - Omit para remover campos
type CreateCarePlanInput = Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>

// ✅ Correcto - Partial para actualizaciones
async function updateCarePlan(
  id: string,
  updates: Partial<Omit<CarePlan, 'id' | 'createdAt'>>
) {
  // ...
}

// ✅ Correcto - Pick para seleccionar campos
type CarePlanSummary = Pick<CarePlan, 'id' | 'title' | 'status'>
```

### Evitar `any`, Usar `unknown`

```typescript
// ✅ Correcto - Usar unknown para tipos desconocidos
function validateResident(data: unknown): Result<Resident, ResidentError> {
  const result = ResidentSchema.safeParse(data)
  // ...
}

// ❌ Incorrecto - Evitar any
function validateResident(data: any): Resident {
  // ...
}
```

### Props de Componentes Vue

Usar interfaces TypeScript para props:

```typescript
// ✅ Correcto - Props tipadas
interface Props {
  residentId: string
  isActive?: boolean
  onUpdate?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})
```

---

## Componentes Vue

### Estructura de Componentes

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

import AppButton from '@/business/common/presentation/atoms/Button.vue'
import { useAuthStore } from '@/business/auth/store'

defineOptions({
  name: 'AppResidentForm',
})

interface Props {
  residentId?: string
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
})

const emit = defineEmits<{
  success: [value: string]
  cancel: []
}>()

// State, computed, methods
const isLoading = ref(false)
const classes = computed(() => ({
  'resident-form': true,
  'resident-form--editing': props.isEditing,
}))
</script>

<template>
  <form :class="classes">
    <!-- Template content -->
  </form>
</template>

<style scoped>
.resident-form {
  /* Styles */
}
</style>
```

### Convenciones

- **`<script setup lang="ts">`**: Siempre usar script setup
- **`defineOptions`**: Definir nombre del componente (`App{ComponentName}`)
- **Props**: Interfaces TypeScript con `defineProps<Props>()`
- **Emits**: Tipados con `defineEmits<{...}>()`
- **Computed**: Para propiedades derivadas
- **Estilos**: Siempre `scoped`

---

## Comentarios

### Cuándo Comentar

- **Clarificar "por qué"**, no "qué" (el código debe ser autoexplicativo)
- **Lógica de negocio compleja** que requiere contexto adicional
- **Funciones públicas de APIs/librerías** con JSDoc

### Cuándo NO Comentar

- **Código obvio** que ya explica su propósito
- **Refactorizaciones temporales** ("TODO: refactor later")
- **Explicaciones redundantes** del código

```typescript
// ✅ Correcto - Explica "por qué"
// Add current user as assigned caregiver if not already included
// (required for proper permission tracking)
const residentWithCaregiver = {
  ...residentData,
  assignedCaregivers: residentData.assignedCaregivers.includes(authStore.user.uid)
    ? residentData.assignedCaregivers
    : [...residentData.assignedCaregivers, authStore.user.uid],
}

// ❌ Incorrecto - Comentario obvio
// Set isLoading to true
isLoading.value = true

// ❌ Incorrecto - TODO sin contexto
// TODO: refactor this
```

### JSDoc para APIs Públicas

```typescript
/**
 * Validates a resident entity using Zod schema
 * @param resident - The resident data to validate (can be unknown)
 * @returns Result containing validated Resident or validation error
 */
export function validateResident(resident: unknown): Result<Resident, ResidentError> {
  // ...
}
```

### Comentarios en Español

Para lógica de negocio específica del dominio, usar español:

```typescript
// Convertir Firestore Timestamp a Date para el dominio
function timestampToDate(timestamp: TimestampLike): Date {
  // ...
}
```

---

## Result Type Pattern

### Uso en Repositorios

Siempre usar `Result<T, E>` en métodos de repositorio:

```typescript
export interface CarePlanRepository {
  findById(id: string): Promise<Result<CarePlan | null, CarePlanError>>
  create(carePlan: CreateCarePlanInput): Promise<Result<CarePlan, CarePlanError>>
  update(id: string, updates: Partial<CarePlan>): Promise<Result<CarePlan, CarePlanError>>
}
```

### Uso en Composables

Verificar `result.success` antes de acceder a `result.value`:

```typescript
// ✅ Correcto - Verificar success
const result = await repository.findById(id)
if (result.success) {
  carePlan.value = result.value // TypeScript sabe que value existe
} else {
  error.value = result.error // TypeScript sabe que error existe
}

// ❌ Incorrecto - Acceso directo sin verificar
const result = await repository.findById(id)
carePlan.value = result.value // Error: value puede no existir si result.success === false
```

### Helpers Result

```typescript
// Ok() para éxito
return Ok(createdEntity)

// Err() para errores
return Err(createEntityNotFoundError('Entity not found'))
```

---

## Espaciado y Formato

### Líneas en Blanco

Usar líneas en blanco para separar bloques lógicos:

```typescript
// ✅ Correcto - Líneas en blanco entre bloques
import { ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'

export function useResidents() {
  const residents = ref<Resident[]>([])

  const loadResidents = async () => {
    // ...
  }

  return {
    residents,
    loadResidents,
  }
}
```

### Reglas

- **Después de imports**: Línea en blanco entre grupos de imports
- **Antes de return**: Línea en blanco antes de return en funciones
- **Entre bloques lógicos**: Líneas en blanco entre secciones relacionadas
- **Máximo 100 caracteres**: Prettier formatea automáticamente

### Indentación

- **2 espacios**: Nunca tabs
- **Consistente**: Mismo nivel de indentación para bloques relacionados

```typescript
// ✅ Correcto - Indentación consistente (2 espacios)
if (result.success) {
  carePlans.value = result.value
} else {
  error.value = result.error
}
```

---

## Recursos

- **Prettier Config**: `.prettierrc.json`
- **ESLint Config**: `eslint.config.ts`
- **EditorConfig**: `.editorconfig`
- **Result Type**: `src/shared/domain/Result.ts`
- **Ejemplo Store**: `src/business/care-plans/store.ts`
- **Ejemplo Composable**: `src/business/residents/app/useResidents.ts`
- **Ejemplo Component**: `src/business/residents/presentation/components/ResidentForm.vue`
