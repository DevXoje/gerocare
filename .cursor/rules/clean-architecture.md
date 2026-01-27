# Clean Architecture Rules for GeroCare

These rules are ALWAYS ACTIVE and must be followed when writing code in GeroCare.

## Core Principles

GeroCare follows Clean Architecture with strict layer separation:

```
Presentation → Application → Domain ← Infrastructure
```

**Key Rule**: Dependencies flow inward only. Outer layers depend on inner layers, never the reverse.

## Layer Rules

### Domain Layer (`src/business/*/domain/`)

**Purpose**: Pure business logic, framework-independent.

**Can import from:**
- `shared/domain` - Shared domain types
- `shared/validation` - Validation utilities

**MUST NOT import from:**
- `app/` - Application layer
- `infrastructure/` - Infrastructure layer
- `presentation/` - Presentation layer
- Other business modules' `domain/` - No cross-module domain imports

**Contains:**
- Entity interfaces (e.g., `Resident.ts`)
- Repository interfaces (e.g., `ResidentRepository.ts`)
- Zod validation schemas (e.g., `Resident.schema.ts`)
- Domain error types (e.g., `ResidentErrors.ts`)

### Application Layer (`src/business/*/app/`)

**Purpose**: Use cases and business logic orchestration.

**Can import from:**
- `domain/` of the same module
- `shared/` - Shared utilities

**MUST NOT import from:**
- `infrastructure/` - Use repository interfaces from domain instead
- `presentation/` - Presentation concerns are separate

**Contains:**
- Composables (e.g., `useResidents.ts`, `useAuth.ts`)
- Form handlers
- Application helpers

### Infrastructure Layer (`src/business/*/infrastructure/`)

**Purpose**: Concrete implementations of repositories and external services.

**Can import from:**
- `domain/` of the same module (to implement interfaces)
- `shared/` - Shared utilities

**MUST NOT import from:**
- `app/` - Application layer
- `presentation/` - Presentation layer

**Contains:**
- Firestore repositories (e.g., `FirestoreResidentRepository.ts`)
- Repository factories (e.g., `index.ts`)
- Seeds and test data

### Presentation Layer (`src/business/*/presentation/`)

**Purpose**: Vue components and UI.

**Can import from:**
- `app/` of the same module (composables)
- `domain/` of the same module (types and schemas)
- `shared/` - Shared utilities
- `@design-system/*` - UI components (alias to `src/ui/`)

**MUST NOT import from:**
- `infrastructure/` - Never import infrastructure directly

**AVOID importing from:**
- `presentation/` of other modules - Prefer shared UI components

## Dependency Direction

**Always enforce this flow:**

1. **Presentation** uses **Application** composables
2. **Application** uses **Domain** entities and repository interfaces
3. **Infrastructure** implements **Domain** repository interfaces
4. **Presentation** receives data from **Application**, never from **Infrastructure**

## Repository Pattern

**Critical**: Repositories are defined in Domain, implemented in Infrastructure.

```typescript
// Domain: Interface
export interface ResidentRepository {
  findAll(): Promise<Result<Resident[], ResidentError>>
  findById(id: string): Promise<Result<Resident | null, ResidentError>>
}

// Infrastructure: Implementation
export function createResidentRepository(db: Firestore): ResidentRepository {
  // Implementation using Firestore
}
```

**Rule**: Application layer uses repository interfaces, never concrete implementations.

## Validation

Use dependency-cruiser to validate architecture:

```bash
npm run analyze:deps:validate
```

This will fail the build if critical violations are found:
- Presentation importing from Infrastructure
- Application importing from Infrastructure or Presentation
- Domain importing from other layers

## Module Structure

Each business module follows this structure:

```
src/business/{feature}/
├── domain/          # Entities, interfaces, schemas, errors
├── app/             # Composables, use cases
├── infrastructure/  # Firestore implementations
└── presentation/    # Vue components, pages
```

## Common Violations to Avoid

❌ **Presentation importing Infrastructure:**
```typescript
// ❌ WRONG
import { createResidentRepository } from '../infrastructure'
```

✅ **Correct: Use Application layer:**
```typescript
// ✅ CORRECT
import { useResidents } from '../app/useResidents'
```

❌ **Application importing Infrastructure:**
```typescript
// ❌ WRONG
import { db } from '@/shared/infrastructure/firebase/firebase.config'
```

✅ **Correct: Use Domain repository interface:**
```typescript
// ✅ CORRECT
import type { ResidentRepository } from '../domain/ResidentRepository'
```

## Resources

- Full documentation: [`docs/architecture/README.md`](../../docs/architecture/README.md)
- Feature development guide: [`.cursor/skills/feature-development/SKILL.md`](../skills/feature-development/SKILL.md)
- Validation skill: [`.cursor/skills/clean-architecture/SKILL.md`](../skills/clean-architecture/SKILL.md)
