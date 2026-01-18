# Agent Skills

This document lists all available skills for AI agents working on this project.

## How to Use This Guide

- Start here for project-wide patterns and conventions for GeroCare.
- Use the skills below for detailed guidance on specific topics.
- Skills provide step-by-step instructions, patterns, and decision trees for common development tasks.

## Available Skills

Use these skills for detailed patterns on-demand:

| Skill | Description | Reference |
|-------|-------------|-----------|
| `testing` | Testing strategy and patterns for GeroCare using Vitest, Playwright, and testing utilities | [SKILL.md](.cursor/skills/testing/SKILL.md) |
| `docker` | Docker setup, commands, and troubleshooting for the GeroCare development environment | [SKILL.md](.cursor/skills/docker/SKILL.md) |
| `skill-creator` | Creates new AI agent skills following the Agent Skills spec | [SKILL.md](.cursor/skills/skill-creator/SKILL.md) |
| `extracting-stitch-mockups` | Extract generated mockup images from Google Stitch project pages | [SKILL.md](.cursor/skills/extracting-stitch-mockups/SKILL.md) |
| `ui-components` | Patterns and conventions for creating agnostic UI components in GeroCare | [SKILL.md](.cursor/skills/ui-components/SKILL.md) |
| `feature-development` | Patterns and conventions for implementing complete features following Clean Architecture | [SKILL.md](.cursor/skills/feature-development/SKILL.md) |
| `zod` | Patterns and conventions for using Zod validation schemas in GeroCare following Clean Architecture | [SKILL.md](.cursor/skills/zod/SKILL.md) |
| `coding-style` | Coding style guide and conventions for GeroCare | [SKILL.md](.cursor/skills/coding-style/SKILL.md) |

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
| Creating new features, domain entities, repositories, composables, or business logic | `feature-development` |
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
```

### Commit Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`