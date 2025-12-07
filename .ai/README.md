# Garnetinsight AI Development Rules

This directory contains the **single source of truth** for AI-assisted development rules and workflows in Garnetinsight. These rules are used by multiple AI coding assistants:

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

- **github** - GitHub integration (issues, PRs, repository operations)
- **memory** - Persistent context storage across sessions
- **sequential-thinking** - Enhanced reasoning for complex tasks
- **context-7** - Advanced context management
- **atlassian** - JIRA (RI-XXX tickets) and Confluence integration

## Structure

```
.ai/                                  # 🎯 Single source of truth
├── README.md                         # Overview & quick reference
├── rules/                            # Development standards (modular)
│   ├── code-quality.md               # Linting, TypeScript standards
│   ├── frontend.md                   # React, Redux, UI patterns
│   ├── backend.md                    # NestJS, API patterns
│   ├── testing.md                    # Testing standards
│   ├── branches.md                   # Branch naming conventions
│   ├── commits.md                    # Commit message guidelines
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

**Garnetinsight** is a desktop application for Redis database management built with:

- **Frontend**: React 18, TypeScript, Redux Toolkit, Elastic UI, Monaco Editor, Vite
- **Backend**: NestJS, TypeScript, Node.js
- **Desktop**: Electron for cross-platform distribution
- **Testing**: Jest, Testing Library, Playwright

**Architecture**:

```
garnetinsight/
├── ui/          # React frontend (Vite + TypeScript)
├── api/         # NestJS backend (TypeScript)
├── desktop/     # Electron main process
└── tests/       # E2E tests (Playwright)
```

## Detailed Guidelines

All detailed development standards, coding practices, and workflows are maintained in modular files:

- **Code Quality Standards**: See `.ai/rules/code-quality.md`
- **Frontend Patterns**: See `.ai/rules/frontend.md`
- **Backend Patterns**: See `.ai/rules/backend.md`
- **Testing Standards**: See `.ai/rules/testing.md`
- **Branch Naming**: See `.ai/rules/branches.md`
- **Commit Messages**: See `.ai/rules/commits.md`
- **Pull Request Process**: See `.ai/rules/pull-requests.md`

## Updating These Rules

To update AI rules:

1. **Edit files in `.ai/` only** (never edit symlinked files directly)
2. Changes automatically propagate to all AI tools
3. Commit changes to version control

**Remember**: These rules exist to maintain code quality and consistency. Follow them, but also use good judgment.
