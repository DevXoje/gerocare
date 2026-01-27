# Vue 3 Patterns for GeroCare

These rules are ALWAYS ACTIVE for Vue components and composables in GeroCare.

## Component Structure

**Always use this structure for Vue components:**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

import { useAuthStore } from '@/business/auth/store'
import type { Resident } from '@/business/residents/domain/Resident'

defineOptions({
  name: 'AppComponentName',
})

interface Props {
  // Props definition
}

const props = withDefaults(defineProps<Props>(), {
  // Default values
})

const emit = defineEmits<{
  'event-name': [value: Type]
}>()

// State, computed, methods
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles */
</style>
```

## Critical Rules

### 1. Always Use `<script setup lang="ts">`

**Rule**: Every Vue component MUST use `<script setup lang="ts">`.

```vue
<!-- ✅ CORRECT -->
<script setup lang="ts">
// Component code
</script>

<!-- ❌ WRONG -->
<script lang="ts">
export default {
  // Options API
}
</script>
```

### 2. Component Naming with `defineOptions`

**Rule**: Always define component name using `defineOptions` with `App` prefix.

```typescript
defineOptions({
  name: 'AppResidentForm',  // ✅ CORRECT
})

// ❌ WRONG - Missing defineOptions
// ❌ WRONG - Wrong prefix (should be App, not ResidentForm)
```

**Naming pattern**: `App{Feature}{ComponentType}`

Examples:
- `AppResidentForm`
- `AppMedicationCard`
- `AppActivityLogList`

### 3. Props Definition

**Rule**: Always use TypeScript interfaces for props.

```typescript
// ✅ CORRECT
interface Props {
  residentId: string
  isActive?: boolean
  onUpdate?: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

// ❌ WRONG - No interface
const props = defineProps({
  residentId: String,
  isActive: Boolean,
})
```

### 4. Emits Definition

**Rule**: Always type emits with `defineEmits<{...}>()`.

```typescript
// ✅ CORRECT
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [data: FormData]
  'cancel': []
}>()

// ❌ WRONG - Untyped emits
const emit = defineEmits(['update:modelValue', 'submit'])
```

### 5. Always Use Scoped Styles

**Rule**: Always use `<style scoped>` to prevent style leakage.

```vue
<!-- ✅ CORRECT -->
<style scoped>
.component {
  /* Styles */
}
</style>

<!-- ❌ WRONG - Global styles (unless intentional) -->
<style>
.component {
  /* Styles */
}
</style>
```

## Composable Patterns

### Naming Convention

**Rule**: Composables MUST start with `use` prefix and use PascalCase for the rest.

```typescript
// ✅ CORRECT
export function useResidents() { }
export function useAuth() { }
export function useMedicationForm() { }

// ❌ WRONG
export function residents() { }  // Missing 'use' prefix
export function use_residents() { }  // Wrong case
```

### Composable Structure

**Rule**: Follow this structure for composables:

```typescript
import { ref, computed } from 'vue'
import { createRepository } from '../infrastructure'
import type { Entity } from '../domain/Entity'
import type { EntityError } from '../domain/EntityErrors'

const repository = createRepository()

export function useEntity() {
  // State
  const entities = ref<Entity[]>([])
  const entity = ref<Entity | null>(null)
  const isLoading = ref(false)
  const error = ref<EntityError | null>(null)

  // Computed
  const hasEntities = computed(() => entities.value.length > 0)

  // Methods
  const loadEntities = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await repository.findAll()
      if (result.success) {
        entities.value = result.value
      } else {
        error.value = result.error
      }
    } catch {
      error.value = { code: 'UNKNOWN_ERROR', message: 'Failed to load entities' }
    } finally {
      isLoading.value = false
    }
  }

  // Return
  return {
    entities: computed(() => entities.value),
    entity: computed(() => entity.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    hasEntities,
    loadEntities,
  }
}
```

### Composable Return Values

**Rule**: Return computed refs, not raw refs, for reactivity.

```typescript
// ✅ CORRECT - Return computed
return {
  entities: computed(() => entities.value),
  isLoading: computed(() => isLoading.value),
}

// ❌ WRONG - Return raw refs (breaks reactivity)
return {
  entities: entities.value,  // Not reactive!
  isLoading: isLoading.value,
}
```

## Pinia Stores vs Composables

### When to Use Stores

**Use Pinia stores when:**
- State is shared across multiple features
- Complex state management is needed
- You need Pinia devtools/debugging features
- State persists across route changes

**Use composables when:**
- State is feature-specific
- Simple CRUD operations
- State doesn't need to persist

**Rule**: Prefer composables for feature-specific state. Use stores only when necessary.

```typescript
// ✅ CORRECT - Composable for feature-specific state
export function useResidents() {
  const residents = ref<Resident[]>([])
  // ...
}

// ✅ CORRECT - Store for shared state
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  // ...
})
```

## Form Patterns

### Form State Management

**Rule**: Use refs for form data, computed for validation.

```typescript
const form = ref<Partial<Entity>>({
  name: '',
  email: '',
})

const isFormValid = computed(() => {
  return !!form.value.name && !!form.value.email
})

const submit = async () => {
  if (!isFormValid.value) return
  // Submit logic
}
```

### v-model Support

**Rule**: Always support v-model for form inputs.

```typescript
interface Props {
  modelValue: string | number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
```

## Directives and Common Patterns

### v-if vs v-show

**Rule**: Use `v-if` for conditional rendering, `v-show` for toggling visibility.

```vue
<!-- ✅ CORRECT - v-if for conditional rendering -->
<div v-if="isLoading">Loading...</div>

<!-- ✅ CORRECT - v-show for toggling visibility -->
<div v-show="hasError" class="error">Error message</div>
```

### v-for Keys

**Rule**: Always provide unique `:key` in `v-for`.

```vue
<!-- ✅ CORRECT -->
<div v-for="resident in residents" :key="resident.id">
  {{ resident.name }}
</div>

<!-- ❌ WRONG - Missing key -->
<div v-for="resident in residents">
  {{ resident.name }}
</div>
```

### Event Handlers

**Rule**: Use inline handlers for simple operations, methods for complex logic.

```vue
<!-- ✅ CORRECT - Inline for simple -->
<button @click="count++">Increment</button>

<!-- ✅ CORRECT - Method for complex -->
<button @click="handleSubmit">Submit</button>
```

## Import Organization

**Rule**: Follow this import order in components:

1. Vue core imports
2. Type imports (separate line)
3. Store/composable imports
4. Component imports
5. Style imports

```typescript
// ✅ CORRECT
import { computed, ref } from 'vue'

import type { Resident } from '@/business/residents/domain/Resident'
import { useResidents } from '@/business/residents/app/useResidents'
import { Button } from '@design-system/atoms'
import './styles.css'
```

## Resources

- Full coding style: [`docs/CODING_STYLE.md`](../../docs/CODING_STYLE.md)
- Coding style skill: [`.cursor/skills/coding-style/SKILL.md`](../skills/coding-style/SKILL.md)
- UI components skill: [`.cursor/skills/ui-components/SKILL.md`](../skills/ui-components/SKILL.md)
