# GitHub Copilot Instructions for RedisInsight

> **📚 All development rules and guidelines are in the `.ai/` directory**

This project uses a centralized AI rules structure. All detailed guidelines, standards, and workflows are maintained in the `.ai/` directory as the single source of truth.

## 📂 Rules Structure

### Core Development Rules

- **Code Quality**: `.ai/rules/code-quality.md`

  - ESLint configuration (Airbnb base)
  - Prettier formatting standards
  - TypeScript best practices
  - Import organization
  - SonarJS complexity rules

- **Frontend Development**: `.ai/rules/frontend.md`

  - React 18 patterns and best practices
  - Redux Toolkit state management
  - Styled-components (SCSS deprecated)
  - Component folder structure
  - Internal UI component wrappers (never import from @redis-ui directly)
  - Elastic UI deprecation (use Redis UI wrappers)

- **Backend Development**: `.ai/rules/backend.md`

  - NestJS module architecture
  - Service and controller patterns
  - DTOs and validation
  - Error handling
  - Redis integration patterns

- **Testing Standards**: `.ai/rules/testing.md`

  - Jest and Testing Library patterns
  - Component testing with renderComponent helper
  - Faker for test data generation
  - No fixed timeouts (use waitFor)
  - Backend testing with NestJS
  - E2E testing with Playwright

- **Branch Naming**: `.ai/rules/branches.md`

  - Branch naming conventions (type/RI-XXX/title or type/XXX/title)

- **Commit Messages**: `.ai/rules/commits.md`

  - Commit message format (Conventional Commits)

- **Pull Requests**: `.ai/rules/pull-requests.md`
  - PR process and review guidelines
  - Pre-commit checklist

### Commands and Workflows

- **Commit Message Generation**: `.ai/commands/commit-message.md`
- **PR Review**: `.ai/commands/pull-request-review.md`

## 🎯 Project Overview

**Tech Stack:**

- Frontend: React 18, TypeScript, Redux Toolkit, styled-components, Vite
- Backend: NestJS, TypeScript, Node.js
- Desktop: Electron
- Testing: Jest, Testing Library, Playwright

**Module Aliases:**

- `uiSrc/*` → `redisinsight/ui/src/*`
- `apiSrc/*` → `redisinsight/api/src/*`
- `desktopSrc/*` → `redisinsight/desktop/src/*`

## 📖 Additional Documentation

For a comprehensive introduction and quick reference, see: `.ai/README.md`

---

**Note**: This is a minimal reference file. GitHub Copilot cannot read the referenced files directly, but developers can access the full guidelines in the `.ai/` directory. Other AI tools (Cursor, Augment, Windsurf) access these rules via symlinks.
