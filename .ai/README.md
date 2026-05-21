# RedisInsight AI Development Rules

This directory contains the **single source of truth** for AI-assisted development rules and workflows in RedisInsight.

## Overview

This repository uses a centralized approach to AI development rules:

- **`AGENTS.md`** (at repository root) - Entry point for AI agents with essential commands, testing instructions, and quick reference
- **`.ai/skills/`** - Detailed development standards as skills, plus skills from npm packages
- **`.ai/commands/`** - AI workflow commands and templates

These standards are consumed by:

- **Claude Code** (via `CLAUDE.md -> AGENTS.md` plus `.claude/commands/` and `.claude/skills/` symlinks)
- **Codex** (via `AGENTS.md` and the `.agents/skills` symlink)
- **GitHub Copilot** (via file: `.github/copilot-instructions.md`, optional)

## Structure

```
AGENTS.md                              # 🎯 AI agent entry point
CLAUDE.md -> AGENTS.md                 # Claude Code entry point
.ai/                                   # Single source of truth
├── README.md                          # This file (human-readable overview)
├── skills/                            # Development standards and agent skills
│   ├── code-quality/SKILL.md          # Linting, TypeScript standards, naming, imports
│   ├── frontend/SKILL.md              # React, Redux, styled-components, UI patterns
│   ├── backend/SKILL.md               # NestJS, API patterns, DI, error handling
│   ├── testing/SKILL.md               # Jest/Testing Library standards, faker, helpers
│   ├── e2e-testing/SKILL.md           # Playwright standards, page objects, fixtures
│   ├── git-safety/SKILL.md            # Protected-branch guardrails
│   ├── branches/SKILL.md              # Branch naming
│   ├── commits/SKILL.md               # Commit messages (Conventional Commits)
│   ├── pull-requests/SKILL.md         # Pull request process
│   ├── feature-flags/SKILL.md         # Feature flag lifecycle
│   ├── tsconfigs/SKILL.md             # TypeScript configuration
│   ├── type-check-baselines/SKILL.md  # TS error baseline workflow
│   └── redis-ui-components/ -> node_modules/@redis-ui/components/skills/redis-ui-components
│       ├── SKILL.md                   # Component catalog and usage patterns
│       └── references/                # Per-component API docs (Button, Select, etc.)
└── commands/                          # AI workflow commands
    ├── pr-plan.md                     # JIRA ticket implementation planning
    ├── commit-message.md              # Commit message generation
    └── pull-request-review.md         # PR review workflow

# Symlinks
.claude/
  ├── commands/ -> ../.ai/commands/    # Claude Code (commands)
  └── skills/ -> ../.ai/skills/        # Claude Code (skills)
.agents/
  └── skills -> ../.ai/skills          # Codex (skills)
.github/copilot-instructions.md        # GitHub Copilot reference (if used)
```

**Codex note**: Codex reads `AGENTS.md` for project instructions and discovers repo skills from `.agents/skills`. Do not create `.codex/rules/`: Codex `.rules` files are command execution policies, not Markdown development guidelines.

## For AI Agents

**Start here**: Read `AGENTS.md` at the repository root for:

- Setup and build commands
- Code quality standards
- Testing instructions
- Git workflow guidelines
- Boundaries and best practices

**Then refer to**: `.ai/skills/` for detailed guidelines on specific topics.

## For Human Developers

This directory contains comprehensive development standards used by AI coding assistants. Each topic lives in its own skill folder:

- **Code Quality**: `.ai/skills/code-quality/SKILL.md` - TypeScript standards, import organization, best practices
- **Frontend**: `.ai/skills/frontend/SKILL.md` - React, Redux, styled-components, UI component usage
- **Backend**: `.ai/skills/backend/SKILL.md` - NestJS, dependency injection, API patterns
- **Testing**: `.ai/skills/testing/SKILL.md` - Jest/Testing Library patterns, faker, helpers
- **E2E Testing**: `.ai/skills/e2e-testing/SKILL.md` - Playwright standards, page objects
- **Git Safety**: `.ai/skills/git-safety/SKILL.md` - Protected-branch guardrails
- **Branches**: `.ai/skills/branches/SKILL.md` - Branch naming conventions
- **Commits**: `.ai/skills/commits/SKILL.md` - Commit message guidelines (Conventional Commits)
- **Pull Requests**: `.ai/skills/pull-requests/SKILL.md` - PR creation and review guidelines
- **Feature Flags**: `.ai/skills/feature-flags/SKILL.md` - Adding, promoting, and removing feature flags
- **TS Error Baselines**: `.ai/skills/type-check-baselines/SKILL.md` - TypeScript error baseline workflow
- **Redis UI Components**: `.ai/skills/redis-ui-components/` - Component API references, props, and usage examples (sourced from `@redis-ui/components` npm package via symlink)

## MCP (Model Context Protocol) Setup

AI tools can access external services (JIRA, Confluence, GitHub, Figma) via MCP configuration.

### Initial Setup

1. **Copy the example configuration:**

   ```bash
   cp env.mcp.example .env.mcp
   ```

2. **Get your Atlassian API token:**

   - Go to: https://id.atlassian.com/manage-profile/security/api-tokens
   - Create a classic token by pressing the first "Create Token" button
   - Copy the token

3. **Edit `.env.mcp` with your credentials:**

   - Add your JIRA and Confluence API tokens
   - Note: Figma MCP server uses OAuth authentication and doesn't require API keys

4. **Verify your setup:**

   **For Cursor users:**

   - Restart Cursor to load the new MCP configuration
   - Ask the AI: "Can you list all available MCP tools and test them?"
   - The AI should be able to access JIRA, Confluence, GitHub, Figma, and other configured services
   - **For Figma**: On first use, you'll be prompted to authenticate via OAuth flow in your browser

   **For Augment users:**

   ```bash
   npx @augmentcode/auggie --mcp-config mcp.json "go over all my mcp tools and make sure they work as expected"
   ```

   **For GitHub Copilot users:**

   - Note: GitHub Copilot does not currently support MCP integration
   - MCP services (JIRA, Confluence, etc.) will not be available in Copilot

### Available MCP Services

The `mcp.json` file configures these services:

- **github** - GitHub integration (issues, PRs, repository operations)
- **memory** - Persistent context storage across sessions
- **sequential-thinking** - Enhanced reasoning for complex tasks
- **context-7** - Advanced context management
- **atlassian** - JIRA (RI-XXX tickets) and Confluence integration (requires API tokens in `.env.mcp`)
- **figma** - Figma design files, frames, and layers (uses OAuth authentication - no API key needed)

## Updating These Rules

To update AI standards:

1. **Edit `SKILL.md` files under `.ai/skills/`** (never edit symlinked files directly)
2. **Update `AGENTS.md`** if you change commands, testing instructions, or the always-on rules block
3. Changes propagate to Claude Code automatically via the `.claude/` symlinks
4. Commit changes to version control

**Remember**: These rules exist to maintain code quality and consistency. Follow them, but also use good judgment.
