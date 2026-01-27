# Agent Skills and Rules

This document lists all available skills and rules for AI agents working on this project.

## How to Use This Guide

- Start here for project-wide patterns and conventions for GeroCare.
- **Rules** are always active and guide fundamental architectural and code style decisions.
- **Skills** are loaded on-demand for specific tasks and provide detailed patterns.
- Use the skills below for detailed guidance on specific topics.

## Rules (Always Active)

Rules provide fundamental guidance that is always applied:

| Rule | Description | Reference |
|------|-------------|-----------|
| `clean-architecture` | Clean Architecture principles, layer rules, and dependency constraints | [clean-architecture.md](.cursor/rules/clean-architecture.md) |
| `vue-patterns` | Vue 3 component structure, composable patterns, and Vue conventions | [vue-patterns.md](.cursor/rules/vue-patterns.md) |

**When to use Rules vs Skills:**
- **Rules**: Fundamental architectural decisions, always-applied patterns (Vue structure, layer dependencies)
- **Skills**: Specific technology patterns, workflows, or detailed guides (Firebase, testing, design system)

## Available Skills

Use these skills for detailed patterns on-demand:

| Skill | Description | Reference |
|-------|-------------|-----------|
| `testing` | Testing strategy and patterns for GeroCare using Vitest, Playwright, and testing utilities | [SKILL.md](.cursor/skills/testing/SKILL.md) |
| `docker` | Docker setup, commands, and troubleshooting for the GeroCare development environment | [SKILL.md](.cursor/skills/docker/SKILL.md) |
| `skill-creator` | Creates new AI agent skills following the Agent Skills spec | [SKILL.md](.cursor/skills/skill-creator/SKILL.md) |
| `extracting-stitch-mockups` | Extract generated mockup images from Google Stitch project pages | [SKILL.md](.cursor/skills/extracting-stitch-mockups/SKILL.md) |
| `ui-components` | Patterns and conventions for creating agnostic UI components in GeroCare | [SKILL.md](.cursor/skills/ui-components/SKILL.md) |
| `ui-design-system` | UI design system toolkit for creating design tokens, visual consistency, and developer handoff documentation | [SKILL.md](.cursor/skills/ui-design-system/SKILL.md) |
| `ux-researcher-designer` | UX research and design toolkit for persona generation, journey mapping, usability testing, and research synthesis | [SKILL.md](.cursor/skills/ux-researcher-designer/SKILL.md) |
| `frontend-ui-ux` | Designer-turned-developer who crafts stunning UI/UX even without design mockups | [SKILL.md](.cursor/skills/frontend-ui-ux/SKILL.md) |
| `feature-development` | Patterns and conventions for implementing complete features following Clean Architecture | [SKILL.md](.cursor/skills/feature-development/SKILL.md) |
| `clean-architecture` | Validation and maintenance guides for Clean Architecture in GeroCare | [SKILL.md](.cursor/skills/clean-architecture/SKILL.md) |
| `firebase` | Patterns and conventions for working with Firebase Auth and Firestore in GeroCare | [SKILL.md](.cursor/skills/firebase/SKILL.md) |
| `zod` | Patterns and conventions for using Zod validation schemas in GeroCare following Clean Architecture | [SKILL.md](.cursor/skills/zod/SKILL.md) |
| `coding-style` | Coding style guide and conventions for GeroCare | [SKILL.md](.cursor/skills/coding-style/SKILL.md) |

### Skill Relationships

Skills are designed to work together. Common workflows:

- **Feature Development**: `feature-development` → `clean-architecture` (validation) → `firebase` (infrastructure) → `zod` → `coding-style` → `testing`
- **UI/UX Design**: `ux-researcher-designer` → `frontend-ui-ux` → `ui-design-system` → `ui-components`
- **Component Development**: `ui-design-system` → `ui-components` → `coding-style` → `testing`
- **Architecture Validation**: `clean-architecture` → validates work from `feature-development`

**Rules vs Skills:**
- **Rules** (always active): Fundamental architectural and Vue patterns
- **Skills** (on-demand): Specific technology patterns, workflows, validation guides

For detailed guidance on when to use each skill, see [SKILLS_GUIDE.md](.cursor/skills/SKILLS_GUIDE.md) and [SKILLS_DECISION_TREE.md](.cursor/skills/SKILLS_DECISION_TREE.md).

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating new skills | `skill-creator` |
| Creating unit tests, integration tests, or E2E tests | `testing` |
| Setting up test helpers, factories, or fixtures | `testing` |
| Mocking Firebase, Vue Router, Pinia, or other dependencies | `testing` |
| Testing Vue components with @vue/test-utils | `testing` |
| Working with Docker configuration (Dockerfile, docker-compose.yml) | `docker` |
| Troubleshooting Docker issues | `docker` |
| Setting up the development environment | `docker` |
| Extracting mockup images from Google Stitch projects | `extracting-stitch-mockups` |
| Creating new UI components, reusable components, or building the component library | `ui-components` |
| Creating or updating design tokens, generating color palettes, documenting design system | `ui-design-system` |
| Conducting user research, creating personas, journey mapping, usability testing | `ux-researcher-designer` |
| Creating UI/UX designs, visual interfaces, or implementing aesthetic design decisions | `frontend-ui-ux` |
| Creating new features, domain entities, repositories, composables, or business logic | `feature-development` |
| Validating architecture, verifying dependencies, or checking Clean Architecture compliance | `clean-architecture` |
| Working with Firebase Auth, Firestore repositories, or Firebase emulators | `firebase` |
| Creating validation schemas, validating domain entities, form data, or Firestore data | `zod` |
| Writing code, refactoring, or making style decisions | `coding-style` |

---

## Project Overview

GeroCare is a web application to assist geriatric caregivers during their workday, facilitating resident management, activity logging, medication administration, and team communication.

| Component | Location | Tech Stack |
|-----------|----------|------------|
| Frontend | `src/` | Vue 3, TypeScript, Vite |
| State Management | `src/business/*/store.ts` | Pinia |
| Backend Services | `src/business/*/infrastructure/` | Firebase (Auth, Firestore) |
| Routing | `src/router/` | Vue Router |
| Testing | `src/**/__tests__/`, `e2e/` | Vitest, Playwright |

### Architecture

The project follows Clean Architecture principles with clear separation of concerns:

- **Domain**: Core business logic and entities (`src/business/*/domain/`)
- **Application**: Use cases and application logic (`src/business/*/app/`)
- **Infrastructure**: External services and implementations (`src/business/*/infrastructure/`)
- **Presentation**: Vue components and pages (`src/business/*/presentation/`)

---

## Development

### Setup

**With Docker (Recommended):**
```bash
docker-compose up --build
```

Access:
- **Application**: http://localhost:5173
- **Firebase UI**: http://localhost:4000

**Local Development:**
```bash
npm install
```

### Common Commands

```bash
# Development
npm run dev                      # Start dev server
npm run dev:emulators            # Start dev server with Firebase emulators

# Building
npm run build                    # Build for production
npm run preview                  # Preview production build

# Testing
npm run test:unit                # Run unit tests with Vitest
npm run test:e2e                 # Run E2E tests with Playwright

# Code Quality
npm run lint                     # Lint with ESLint
npm run format                   # Format with Prettier
npm run type-check               # Type check with vue-tsc

# Firebase
npm run emulators                 # Start Firebase emulators (Auth, Firestore)
npm run seed                      # Create test users and sample data
npm run seed:clear                # Clear all seed data (users, residents, etc.)
```

### Authentication & Login

**When testing or interacting with the application, use the following credentials:**

If you need to log in to the application:
1. **Test user credentials** (example credentials for development):
   - **Email**: `test@gerocare.test`
   - **Password**: `test123456`
2. **If login fails**, it means no users exist in the database. You should:
   - **Option 1**: Register a new user using the "Regístrate" link on the login page
   - **Option 2**: Run `npm run seed` to automatically create test users (creates users like `caregiver1@gerocare.test`, `caregiver2@gerocare.test`, etc.)

**Important**: If the login doesn't work, the user must register first or run the seed script to create test users.

### Commit Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`