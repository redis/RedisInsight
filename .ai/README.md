# RedisInsight AI Development Rules

This directory contains the **single source of truth** for AI-assisted development rules and workflows in RedisInsight. These rules are used by multiple AI coding assistants:

- **Cursor** (via symlinks: `.cursor/rules/` and `.cursor/commands/`)
- **Augment** (via symlink: `.augment/`)
- **Windsurf** (via symlink: `.windsurfrules`)
- **GitHub Copilot** (via file: `.github/copilot-instructions.md`)

## MCP (Model Context Protocol) Setup

AI tools can access external services (JIRA, Confluence, GitHub) via MCP configuration.

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

   ```bash
   ATLASSIAN_DOMAIN=your-domain.atlassian.net
   ATLASSIAN_EMAIL=your-email@example.com
   ATLASSIAN_API_TOKEN=your-api-token-here
   ATLASSIAN_JIRA_PROJECT=RI
   ```

4. **Verify your setup:**

   **For Cursor users:**

   - Restart Cursor to load the new MCP configuration
   - Ask the AI: "Can you list all available MCP tools and test them?"
   - The AI should be able to access JIRA, Confluence, GitHub, and other configured services

   **For Augment users:**

   ```bash
   npx @augmentcode/auggie --mcp-config mcp.json "go over all my mcp tools and make sure they work as expected"
   ```

   **For GitHub Copilot users:**

   - Note: GitHub Copilot does not currently support MCP integration
   - MCP services (JIRA, Confluence, etc.) will not be available in Copilot

### Available MCP Services

The `mcp.json` file configures these services:

- **git** - Git operations (status, diff, log, branch management)
- **github** - GitHub integration (issues, PRs, repository operations)
- **memory** - Persistent context storage across sessions
- **sequential-thinking** - Enhanced reasoning for complex tasks
- **context-7** - Advanced context management
- **atlassian** - JIRA (RI-XXX tickets) and Confluence integration

**Note**: Never commit `.env.mcp` to version control (it's in `.gitignore`)!

## Structure

```
.ai/                                  # 🎯 Single source of truth
├── README.md                         # Overview & quick reference
├── rules/                            # Development standards (modular)
│   ├── code-quality.md               # Linting, TypeScript standards
│   ├── frontend.md                   # React, Redux, UI patterns
│   ├── backend.md                    # NestJS, API patterns
│   ├── testing.md                    # Testing standards
│   ├── branches.md              # Branch naming conventions
│   ├── commits.md            # Commit message guidelines
│   └── pull-requests.md              # Pull request process
└── commands/                         # AI workflow commands
    ├── commit-message.md             # Commit message generation
    └── pull-request-review.md        # PR review workflow

# Symlinks (all AI tools read from .ai/)
.cursor/
  ├── rules/ -> ../.ai/rules/         # Cursor AI (rules)
  └── commands/ -> ../.ai/commands/   # Cursor AI (commands)
.augment/ -> .ai/                     # Augment AI
.windsurfrules -> .ai/                # Windsurf AI
.github/copilot-instructions.md       # GitHub Copilot
```

## Project Overview

**RedisInsight** is a desktop application for Redis database management built with:

- **Frontend**: React 18, TypeScript, Redux Toolkit, Elastic UI, Monaco Editor, Vite
- **Backend**: NestJS, TypeScript, Node.js
- **Desktop**: Electron for cross-platform distribution
- **Testing**: Jest, Testing Library, Playwright

**Architecture**:

```
redisinsight/
├── ui/          # React frontend (Vite + TypeScript)
├── api/         # NestJS backend (TypeScript)
├── desktop/     # Electron main process
└── tests/       # E2E tests (Playwright)
```

## Quick Reference

### Essential Commands

```bash
# Development
yarn dev:ui              # Start UI dev server
yarn dev:api             # Start API dev server
yarn dev:desktop         # Start full Electron app

# Testing
yarn test                # Run UI tests
yarn test:api            # Run API tests
yarn test:cov            # Run tests with coverage

# Code Quality
yarn lint                # Lint all code
yarn type-check:ui       # TypeScript type checking
yarn prettier:fix        # Fix formatting on the changed files
```

### Before Every Commit

1. ✅ Run linter: `yarn lint`
2. ✅ Run tests: `yarn test && yarn test:api`
3. ✅ Check types: `yarn type-check:ui`
4. ✅ Fix formatting: `yarn prettier:fix`

### Key Principles

- **Quality over speed** - Write maintainable, testable code
- **Always run linter** after changes
- **No semicolons** in TypeScript files
- **Use styled-components** for styling (migrating from SCSS modules)
- **Use faker** for test data generation
- **Never use fixed timeouts** in tests
- **Test coverage** must meet thresholds (80% statements/lines)

## Module Aliases

- `uiSrc/*` → `redisinsight/ui/src/*`
- `apiSrc/*` → `redisinsight/api/src/*`
- `desktopSrc/*` → `redisinsight/desktop/src/*`

## Redis-Specific Context

- Support all Redis data types: String, Hash, List, Set, Sorted Set, Vector Set, Stream, JSON
- Handle Redis modules: RedisJSON, RediSearch, RedisTimeSeries, RedisGraph
- Connection types: Standalone, Cluster, Sentinel
- Features: Workbench, Data Browser, Profiler, SlowLog, Pub/Sub

## For AI Assistants

When helping with RedisInsight development:

### DO:

- ✅ Follow established patterns in the codebase
- ✅ Run linter and tests before suggesting code is complete
- ✅ Use proper TypeScript types (avoid `any`)
- ✅ Write tests for all new features
- ✅ Consider performance and accessibility
- ✅ Handle errors properly
- ✅ Reference relevant existing code

### DON'T:

- ❌ Use `console.log`
- ❌ Add unnecessary comments
- ❌ Ignore linting errors
- ❌ Skip tests
- ❌ Use deprecated APIs
- ❌ Mutate Redux state directly
- ❌ Use magic numbers or unclear names

## Updating These Rules

To update AI rules:

1. **Edit files in `.ai/` only** (never edit symlinked files directly)
2. Changes automatically propagate to all AI tools
3. Commit changes to version control

**Remember**: These rules exist to maintain code quality and consistency. Follow them, but also use good judgment.
