# Clean Architecture Validation Rules

Detailed validation rules and examples for maintaining Clean Architecture in GeroCare.

## Import Validation Examples

### ✅ Valid Imports

#### Presentation Layer
```typescript
// ✅ Application composable (same module)
import { useResidents } from '../app/useResidents'

// ✅ Domain types (same module)
import type { Resident } from '../domain/Resident'

// ✅ Shared utilities
import { useNotifications } from '@/shared/composables/useNotifications'

// ✅ Design system components
import { Button } from '@design-system/atoms'
```

#### Application Layer
```typescript
// ✅ Domain entity (same module)
import type { Resident } from '../domain/Resident'

// ✅ Domain repository interface (same module)
import type { ResidentRepository } from '../domain/ResidentRepository'

// ✅ Shared utilities
import { type Result, Ok, Err } from '@/shared/domain/Result'
```

#### Infrastructure Layer
```typescript
// ✅ Domain interface to implement (same module)
import type { ResidentRepository } from '../domain/ResidentRepository'

// ✅ Domain entity (same module)
import type { Resident } from '../domain/Resident'

// ✅ Shared utilities
import { db } from '@/shared/infrastructure/firebase/firebase.config'
```

#### Domain Layer
```typescript
// ✅ Shared domain types
import type { Result } from '@/shared/domain/Result'

// ✅ Shared validation utilities
import { zodErrorMapper } from '@/shared/validation/zodErrorMapper'
```

### ❌ Invalid Imports

#### Presentation Layer Violations
```typescript
// ❌ WRONG - Importing infrastructure
import { createResidentRepository } from '../infrastructure'

// ❌ WRONG - Importing Firebase directly
import { db } from '@/shared/infrastructure/firebase/firebase.config'
```

#### Application Layer Violations
```typescript
// ❌ WRONG - Importing infrastructure
import { db } from '@/shared/infrastructure/firebase/firebase.config'

// ❌ WRONG - Importing presentation
import ResidentCard from '../presentation/components/ResidentCard.vue'
```

#### Infrastructure Layer Violations
```typescript
// ❌ WRONG - Importing application
import { useResidents } from '../app/useResidents'

// ❌ WRONG - Importing presentation
import ResidentForm from '../presentation/components/ResidentForm.vue'
```

#### Domain Layer Violations
```typescript
// ❌ WRONG - Importing application
import { useResidents } from '../app/useResidents'

// ❌ WRONG - Importing infrastructure
import { db } from '@/shared/infrastructure/firebase/firebase.config'

// ❌ WRONG - Importing from other module's domain
import type { Medication } from '@/business/medication/domain/Medication'
```

## Cross-Module Import Rules

### ✅ Allowed Cross-Module Imports

```typescript
// ✅ Shared utilities (always allowed)
import { type Result } from '@/shared/domain/Result'

// ✅ Design system (from presentation)
import { Button } from '@design-system/atoms'

// ✅ Stores (when needed for cross-feature state)
import { useAuthStore } from '@/business/auth/store'
```

### ❌ Disallowed Cross-Module Imports

```typescript
// ❌ WRONG - Domain importing from other module's domain
import type { Medication } from '@/business/medication/domain/Medication'

// ❌ WRONG - Presentation importing from other module's presentation
import ResidentCard from '@/business/residents/presentation/components/ResidentCard.vue'

// ❌ WRONG - Application importing from other module's application
import { useMedications } from '@/business/medication/app/useMedications'
```

## Validation Checklist

Before committing code, verify:

- [ ] No `presentation` imports from `infrastructure`
- [ ] No `app` imports from `infrastructure` or `presentation`
- [ ] No `domain` imports from other layers
- [ ] No cross-module `domain` imports
- [ ] Repository interfaces defined in `domain`
- [ ] Repository implementations in `infrastructure`
- [ ] Application uses repository interfaces (not implementations)
- [ ] Presentation uses application composables (not repositories)

## Fixing Common Violations

### Problem: Presentation needs data from Firestore

**Wrong approach:**
```typescript
// ❌ Component importing infrastructure
import { createResidentRepository } from '../infrastructure'
const repository = createResidentRepository()
const result = await repository.findAll()
```

**Correct approach:**
```typescript
// ✅ Component using application composable
import { useResidents } from '../app/useResidents'
const { residents, loadResidents } = useResidents()
await loadResidents()
```

### Problem: Application needs to save data

**Wrong approach:**
```typescript
// ❌ Composable importing infrastructure
import { db } from '@/shared/infrastructure/firebase/firebase.config'
await addDoc(collection(db, 'residents'), data)
```

**Correct approach:**
```typescript
// ✅ Composable using repository interface
import type { ResidentRepository } from '../domain/ResidentRepository'
import { createResidentRepository } from '../infrastructure'
const repository = createResidentRepository()
const result = await repository.create(data)
```

### Problem: Domain needs validation

**Wrong approach:**
```typescript
// ❌ Domain importing from app
import { validateResident } from '../app/validateResident'
```

**Correct approach:**
```typescript
// ✅ Domain using shared validation or Zod
import { z } from 'zod'
export const ResidentSchema = z.object({ ... })
```

## Dependency Cruiser Configuration

The project uses dependency-cruiser with these rules:

- **Forbidden**: Presentation → Infrastructure
- **Forbidden**: Application → Infrastructure (except factory pattern)
- **Forbidden**: Domain → Any other layer
- **Forbidden**: Cross-module domain imports
- **Warning**: Cross-module presentation imports

Run `npm run analyze:deps:validate` to check compliance.
