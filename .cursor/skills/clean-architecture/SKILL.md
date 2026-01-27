---
name: clean-architecture
description: >
  Validation and maintenance guides for Clean Architecture in GeroCare.
  Trigger: When validating architecture, verifying dependencies, understanding layer rules, or checking architectural compliance.
license: Apache-2.0
metadata:
  author: gero-cloud
  version: "1.0"
  scope: [root]
auto_invoke: "Validating architecture or verifying Clean Architecture compliance"
---

## When to Use

Use this skill when:
- Validating architecture and dependencies
- Verifying layer rules are being followed
- Understanding dependency constraints
- Checking if imports violate Clean Architecture
- Running architectural validation tools
- Fixing architectural violations

**Don't use this skill when:**
- Creating new features (use `feature-development` instead)
- Writing code following architecture (use `feature-development` instead)
- Understanding how to structure features (use `feature-development` instead)

**Relationship with `feature-development`:**
- `feature-development`: How to create features following Clean Architecture (implementation guide)
- `clean-architecture`: How to validate and maintain architecture (validation guide)

---

## Critical Patterns

### 1. Dependency Rules by Layer

**The dependency flow is unidirectional and strict:**

```
Presentation → Application → Domain ← Infrastructure
```

**Layer-specific rules:**

#### Domain Layer
- ✅ Can import from: `shared/domain`, `shared/validation`
- ❌ **MUST NOT** import from: `app/`, `infrastructure/`, `presentation/`
- ❌ **MUST NOT** import from other modules' `domain/`

#### Application Layer
- ✅ Can import from: `domain/` (same module), `shared/`
- ❌ **MUST NOT** import from: `infrastructure/`, `presentation/`

#### Infrastructure Layer
- ✅ Can import from: `domain/` (same module, to implement interfaces), `shared/`
- ❌ **MUST NOT** import from: `app/`, `presentation/`

#### Presentation Layer
- ✅ Can import from: `app/` (same module), `domain/` (same module), `shared/`, `@design-system/*`
- ❌ **MUST NOT** import from: `infrastructure/`
- ⚠️ **AVOID** importing from other modules' `presentation/`

### 2. Validation with Dependency Cruiser

**Use dependency-cruiser to validate architecture:**

```bash
# Validate architecture (fails on violations)
npm run analyze:deps:validate

# Generate dependency graph
npm run analyze:deps:graph

# Generate HTML report
npm run analyze:deps
```

**Critical violations that fail the build:**
- ❌ `presentation` importing from `infrastructure`
- ❌ `app` importing from `infrastructure` or `presentation`
- ❌ `domain` importing from other layers

**Warnings (don't fail build):**
- ⚠️ `presentation` importing from other modules' `presentation`
- ⚠️ `domain` importing from other modules' `domain`

### 3. Import Validation Rules

**Check imports before committing:**

```typescript
// ✅ CORRECT - Presentation importing from Application
import { useResidents } from '../app/useResidents'

// ✅ CORRECT - Application importing from Domain
import type { Resident } from '../domain/Resident'
import type { ResidentRepository } from '../domain/ResidentRepository'

// ✅ CORRECT - Infrastructure implementing Domain interface
import type { ResidentRepository } from '../domain/ResidentRepository'

// ❌ WRONG - Presentation importing Infrastructure
import { createResidentRepository } from '../infrastructure'

// ❌ WRONG - Application importing Infrastructure
import { db } from '@/shared/infrastructure/firebase/firebase.config'
```

### 4. Directory Structure Validation

**Each feature module must follow this structure:**

```
src/business/{feature}/
├── domain/          # Entities, interfaces, schemas, errors
├── app/             # Composables, use cases
├── infrastructure/  # Firestore implementations
└── presentation/    # Vue components, pages
```

**Validation checklist:**
- ✅ Domain layer exists and contains entities
- ✅ Repository interfaces defined in domain
- ✅ Infrastructure implements domain interfaces
- ✅ Application uses domain interfaces (not infrastructure)
- ✅ Presentation uses application composables

---

## Decision Trees

### Which Layer Should This Code Go In?

```
Is it pure business logic?
├─ Yes → Domain layer
│   └─ Entities, interfaces, validation schemas
│
└─ No → Does it orchestrate business logic?
    ├─ Yes → Application layer
    │   └─ Composables, use cases
    │
    └─ No → Is it external service implementation?
        ├─ Yes → Infrastructure layer
        │   └─ Firestore repositories, external APIs
        │
        └─ No → Presentation layer
            └─ Vue components, pages, UI
```

### Can I Import This?

```
Want to import from another layer?
├─ Presentation → Application? → ✅ YES
├─ Presentation → Domain? → ✅ YES (same module)
├─ Application → Domain? → ✅ YES (same module)
├─ Infrastructure → Domain? → ✅ YES (same module, to implement)
│
└─ Any other combination? → ❌ NO
    └─ Check dependency rules
```

---

## Commands

```bash
# Validate architecture (fails on violations)
npm run analyze:deps:validate

# Generate dependency graph (Mermaid)
npm run analyze:deps:graph

# Generate HTML dependency report
npm run analyze:deps

# Generate all architecture reports
npm run analyze:all
```

**Validation in CI/CD:**
- Architecture validation runs automatically in CI
- Build fails on critical violations
- Warnings are reported but don't fail build

---

## Common Violations and Fixes

### Violation 1: Presentation Importing Infrastructure

**Error:**
```typescript
// ❌ WRONG
import { createResidentRepository } from '../infrastructure'
```

**Fix:**
```typescript
// ✅ CORRECT - Use Application layer
import { useResidents } from '../app/useResidents'
```

### Violation 2: Application Importing Infrastructure

**Error:**
```typescript
// ❌ WRONG
import { db } from '@/shared/infrastructure/firebase/firebase.config'
```

**Fix:**
```typescript
// ✅ CORRECT - Use Domain repository interface
import type { ResidentRepository } from '../domain/ResidentRepository'
import { createResidentRepository } from '../infrastructure' // Only in factory
```

### Violation 3: Domain Importing Other Layers

**Error:**
```typescript
// ❌ WRONG
import { useResidents } from '../app/useResidents'
```

**Fix:**
```typescript
// ✅ CORRECT - Domain is pure, no dependencies on other layers
// Remove the import, domain should not depend on app
```

---

## Validation Workflow

### Before Committing

1. **Run validation:**
   ```bash
   npm run analyze:deps:validate
   ```

2. **Fix any violations:**
   - Check error messages
   - Review import statements
   - Refactor to follow dependency rules

3. **Verify fix:**
   ```bash
   npm run analyze:deps:validate
   ```

### In CI/CD

Architecture validation runs automatically:
- Job: `validate-architecture`
- Command: `npm run analyze:deps:validate`
- Fails build on critical violations

---

## Resources

- **Architecture Documentation**: [`docs/architecture/README.md`](../../../docs/architecture/README.md)
- **Clean Architecture Rule**: [`.cursor/rules/clean-architecture.md`](../../rules/clean-architecture.md)
- **Feature Development**: See `feature-development` skill for implementation patterns
- **Validation Rules**: See [assets/validation-rules.md](assets/validation-rules.md) for detailed validation examples
- **Dependency Cruiser**: https://github.com/sverweij/dependency-cruiser
