# GitHub Copilot Instructions for RedisInsight

> **🎯 Start here: Read `AGENTS.md` at the repository root for essential commands, testing instructions, and quick reference**

This project uses a centralized AI rules structure:

- **`AGENTS.md`** (repository root) - Entry point with commands, testing, and boundaries
- **`.ai/skills/`** - Detailed development standards as skill files (one folder per topic, each with a `SKILL.md`)
- **`.ai/commands/`** - AI workflow commands and templates

## 📂 Skills Structure

### Core Development Skills

- **Code Quality**: `.ai/skills/code-quality/SKILL.md`

  - TypeScript best practices
  - Import organization
  - SonarJS complexity rules

- **Frontend Development**: `.ai/skills/frontend/SKILL.md`

  - React 18 patterns and best practices
  - Redux Toolkit state management
  - Styled-components (SCSS deprecated)
  - Component folder structure
  - Internal UI component wrappers (never import from @redis-ui directly)
  - Elastic UI deprecation (use Redis UI wrappers)

- **Backend Development**: `.ai/skills/backend/SKILL.md`

  - NestJS module architecture
  - Service and controller patterns
  - DTOs and validation
  - Error handling
  - Redis integration patterns

- **Testing Standards**: `.ai/skills/testing/SKILL.md`

  - Jest and Testing Library patterns
  - Component testing with renderComponent helper
  - Faker for test data generation
  - No fixed timeouts (use waitFor)
  - Backend testing with NestJS

- **E2E Testing**: `.ai/skills/e2e-testing/SKILL.md`

  - Playwright standards, page object models, fixtures

- **Git Safety**: `.ai/skills/git-safety/SKILL.md`

  - Protected-branch guardrails (no direct commits to main/latest/release)

- **Commit Messages**: `.ai/skills/commits/SKILL.md`

  - Commit message format (Conventional Commits)

- **Pull Requests**: `.ai/skills/pull-requests/SKILL.md`
  - PR process and review guidelines
  - Pre-commit checklist

### Commands and Workflows

- **PR Plan**: `.ai/commands/pr-plan.md` - Analyze JIRA tickets (RI-XXX) and create detailed implementation plans
- **Commit Message Generation**: `.ai/commands/commit-message.md` - Generate commit messages following Conventional Commits
- **PR Review**: `.ai/commands/pull-request-review.md` - Review pull requests and provide feedback

## 🎯 Project Overview

**Tech Stack:**

- Frontend: React 18, TypeScript, Redux Toolkit, styled-components, Vite
- Backend: NestJS, TypeScript, Node.js
- Desktop: Electron
- Testing: Jest, Testing Library, Playwright

**Module Aliases:**

- `uiSrc/*` → `redisinsight/ui/src/*`
- `apiClient` → `redisinsight/api-client` (auto-generated OpenAPI types consumed by the UI)
- `desktopSrc/*` → `redisinsight/desktop/src/*`

## 📖 Additional Documentation

- **For AI agents**: Start with `AGENTS.md` at repository root
- **For human developers**: See `.ai/README.md` for setup and overview

---

**Note**: This is a minimal reference file. GitHub Copilot cannot read the referenced files directly, but developers can access the full guidelines. Claude Code and Codex read `AGENTS.md` directly; Claude Code additionally auto-discovers skills under `.ai/skills/` (Codex via the `.agents/skills` symlink).
