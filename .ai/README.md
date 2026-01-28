# RedisInsight AI Development Rules

This directory contains the **single source of truth** for AI-assisted development rules and workflows in RedisInsight.

## Overview

This repository uses a centralized approach to AI development rules:

- **`AGENTS.md`** (at repository root) - Entry point for AI agents with essential commands, testing instructions, and quick reference
- **`.ai/rules/`** - Detailed development standards organized by topic
- **`.ai/commands/`** - AI workflow commands and templates

These rules are used by multiple AI coding assistants:

- **Cursor** (via symlinks: `.cursor/rules/` and `.cursor/commands/`)
- **Augment** (via symlink: `.augment/`)
- **Windsurf** (via symlink: `.windsurfrules`)
- **GitHub Copilot** (via file: `.github/copilot-instructions.md`)

## Structure

```
AGENTS.md                              # 🎯 AI agent entry point
.ai/                                   # Single source of truth
├── README.md                          # This file (human-readable overview)
├── rules/                             # Development standards (modular)
│   ├── code-quality.md                # Linting, TypeScript standards
│   ├── frontend.md                    # React, Redux, UI patterns
│   ├── backend.md                     # NestJS, API patterns
│   ├── testing.md                     # Testing standards
│   ├── branches.md                    # Branch naming conventions
│   ├── commits.md                     # Commit message guidelines
│   └── pull-requests.md               # Pull request process
└── commands/                          # AI workflow commands
    ├── pr-plan.md                     # JIRA ticket implementation planning
    ├── commit-message.md              # Commit message generation
    └── pull-request-review.md         # PR review workflow

# Symlinks (all AI tools read from .ai/)
.cursor/
  ├── rules/ -> ../.ai/rules/          # Cursor AI (rules)
  └── commands/ -> ../.ai/commands/  # Cursor AI (commands)
.augment/ -> .ai/                      # Augment AI
.windsurfrules -> .ai/                 # Windsurf AI
.github/copilot-instructions.md        # GitHub Copilot
```

## For AI Agents

**Start here**: Read `AGENTS.md` at the repository root for:

- Setup and build commands
- Code quality standards
- Testing instructions
- Git workflow guidelines
- Boundaries and best practices

**Then refer to**: `.ai/rules/` for detailed guidelines on specific topics.

## For Human Developers

This directory contains comprehensive development standards that are automatically used by AI coding assistants. The rules are organized into modular files for easy maintenance:

- **Code Quality Standards**: `.ai/rules/code-quality.md` - TypeScript standards, import organization, best practices
- **Frontend Patterns**: `.ai/rules/frontend.md` - React, Redux, styled-components, UI component usage
- **Backend Patterns**: `.ai/rules/backend.md` - NestJS, dependency injection, API patterns
- **Testing Standards**: `.ai/rules/testing.md` - Testing patterns, faker usage, test helpers
- **Branch Naming**: `.ai/rules/branches.md` - Branch naming conventions
- **Commit Messages**: `.ai/rules/commits.md` - Commit message guidelines (Conventional Commits)
- **Pull Request Process**: `.ai/rules/pull-requests.md` - PR creation and review guidelines

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

To update AI rules:

1. **Edit files in `.ai/` only** (never edit symlinked files directly)
2. **Update `AGENTS.md`** if you change commands, testing instructions, or boundaries
3. Changes automatically propagate to all AI tools via symlinks
4. Commit changes to version control

**Remember**: These rules exist to maintain code quality and consistency. Follow them, but also use good judgment.
