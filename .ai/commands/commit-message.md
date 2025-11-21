# Commit Message Generation Guidelines

## Purpose

Generate concise, meaningful commit messages following RedisInsight conventions.

## Commit Message Format

Follow **Conventional Commits** format **WITH scope prefixes**:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

- `feat` - New feature
- `fix` - Bug fix (use `bugfix` for branch names)
- `refactor` - Code refactoring (no functional changes)
- `chore` - Maintenance tasks, dependencies
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `style` - Code style changes (formatting, whitespace)
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes

## Scopes

Use scopes to indicate which part of the codebase is affected:

- `api` - Backend API changes
- `ui` - Frontend UI changes
- `e2e` - End-to-end tests
- `ci` - CI/CD configuration
- `deps` - Dependency updates

## Rules

### DO:

- ✅ **Always include scope** in commit messages (e.g., `feat(api):`, `fix(ui):`)
- ✅ Keep messages **concise** (max 250 characters for subject line)
- ✅ Inspect **all uncommitted files** before generating
- ✅ Use `fix(scope):` if changes look like bug fixes
- ✅ Use `refactor(scope):` if changes are code improvements without functional changes
- ✅ Use `feat(scope):` if adding new functionality
- ✅ Provide commit message in **easy to copy format**
- ✅ Be specific about what changed
- ✅ Use imperative mood ("add feature" not "added feature")
- ✅ Start with lowercase after the scope

### DON'T:

- ❌ Don't omit scope - always include it
- ❌ Don't be overly verbose or too vague
- ❌ Don't include file names unless specifically relevant
- ❌ Don't use past tense
- ❌ Don't add period at the end of subject line
- ❌ Don't use multiple scopes in one commit (split into separate commits)

## Examples

### ✅ Good Commit Messages

```
feat(ui): add user profile editing interface

fix(api): resolve memory leak in Redis connection pool

refactor(api): extract validation logic to utility functions

test(e2e): add tests for user authentication flow

docs(api): update endpoint documentation

chore(deps): upgrade React to version 18.2

perf(ui): optimize list rendering with virtualization

style(ui): fix import order and formatting

test(ui): add unit tests for Redux slices

ci: update GitHub Actions workflow
```

### ❌ Bad Commit Messages

```
feat: add user profile editing interface      ❌ Missing scope
Fix(ui): bug in component                     ❌ Capitalize type
added new feature                             ❌ Past tense, no type/scope
fix(ui): stuff                                ❌ Too vague
updated files                                 ❌ Not descriptive, no scope
WIP                                           ❌ Not meaningful
fix(ui): fixed the bug in UserProfile.tsx that was causing issues  ❌ Too verbose
feat(ui,api): add feature                     ❌ Multiple scopes (split into commits)
```

## Multi-Line Commit Messages

For complex changes, use the body to provide more context:

```
feat(api): add Redis cluster support

- Implement connection pooling and automatic failover for Redis cluster configurations
- Cluster node discovery
- Connection retry logic
- Failover handling

References: #123
```

## Special Cases

### Breaking Changes

```
feat(api): redesign authentication flow

BREAKING CHANGE: Auth tokens now expire after 1 hour
instead of 24 hours. Users will need to re-authenticate
more frequently.

References: #RI-123
```

### Multiple Files in Same Scope

When changes span multiple files in the same scope:

```
refactor(ui): restructure Redux store organization

Reorganize slices for better separation of concerns
and improved maintainability.

References: #RI-456
```

### Bug Fixes with Issue References

```
fix(ui): prevent duplicate API calls on component mount

Previously, useEffect was triggering twice due to
missing dependency array.

Fixes #RI-789
# or for GitHub issues:
Fixes #789
```

### Multiple Scopes

If changes affect multiple scopes, create separate commits:

```bash
# ✅ Good: Separate commits
git commit -m "feat(api): add new endpoint for user data

References: #RI-123"

git commit -m "feat(ui): add UI for user data display

References: #RI-123"

# ❌ Bad: Combined in one commit
git commit -m "feat(api,ui): add user data feature"
```

### Referencing Issues in Commit Body

Use these keywords to link commits to issues:

**JIRA Tickets:**

- `References: #RI-123` - Link to ticket
- `Fixes #RI-123` - Close ticket when merged
- `Closes #RI-123` - Close ticket when merged
- `Related to #RI-456` - Related but doesn't close

**GitHub Issues:**

- `Fixes #123` - Close issue when merged
- `Closes #123` - Close issue when merged
- `Resolves #123` - Close issue when merged
- `Related to #456` - Related but doesn't close

**Multiple Issues:**

```
feat(ui): add bulk delete functionality

Implements bulk operations for key deletion with
proper confirmation dialogs and progress tracking.

Fixes #123
Fixes #456
Related to #RI-789
```

## Process for Generating Commit Messages

1. **Inspect all uncommitted files**

   ```bash
   git status
   git diff
   ```

2. **Identify the scope**:

   - API changes? → `api`
   - UI changes? → `ui`
   - Tests? → `e2e` or scope of test
   - Multiple scopes? → Create separate commits

3. **Identify the type of change**:

   - New functionality? → `feat(scope):`
   - Bug fix? → `fix(scope):`
   - Code improvement? → `refactor(scope):`
   - Maintenance? → `chore(scope):`
   - Tests? → `test(scope):`
   - Documentation? → `docs(scope):`

4. **Identify issue/ticket reference**:

   - JIRA ticket? → Add `References: #RI-XXX` or `Fixes #RI-XXX` in body
   - GitHub issue? → Add `Fixes #XXX` or `Closes #XXX` in body
   - Both? → Include both references

5. **Write clear description**:

   - What changed?
   - Why was it changed?
   - Keep subject under 250 characters

6. **Provide in copyable format**:

   ```
   Copy this commit message:

   feat(ui): add dark mode toggle to settings

   Implements user-requested dark mode with system
   preference detection and manual override.

   Fixes #123
   ```

## Tools Integration

### Using JetBrains MCP (if available)

When possible, use JetBrains MCP to inspect uncommitted changes:

- Get list of modified files
- Analyze diffs
- Generate contextual commit message

### Using Terminal

Combine commands for efficiency:

```bash
git status && git diff --stat && git diff
```

## Branch-Specific Considerations

Remember that RedisInsight uses these branch naming conventions:

### Internal Development (JIRA Tickets):

- `feature/RI-XXX/<short-title>` - New features
- `bugfix/RI-XXX/<short-title>` - Bug fixes
- `fe/feature/RI-XXX/<short-title>` - Frontend-only features
- `be/bugfix/RI-XXX/<short-title>` - Backend-only fixes

### Open Source Contributions (GitHub Issues):

- `feature/XXX/<short-title>` - New features
- `bugfix/XXX/<short-title>` - Bug fixes
- `fe/feature/XXX/<short-title>` - Frontend-only features
- `be/bugfix/XXX/<short-title>` - Backend-only fixes

Where:

- `RI-XXX` is the JIRA ticket number (e.g., `RI-123`) - for internal development
- `XXX` is the GitHub issue number (e.g., `456`) - for open source contributions
- **Important**: Branch names don't use `#`, but commit message references do (e.g., `Fixes #456`)

### Matching Branch to Commit:

- `feature/RI-XXX/*` or `feature/XXX/*` → `feat(scope):` commits
- `bugfix/RI-XXX/*` or `bugfix/XXX/*` → `fix(scope):` commits
- `fe/feature/RI-XXX/*` or `fe/feature/XXX/*` → `feat(ui):` commits
- `be/bugfix/RI-XXX/*` or `be/bugfix/XXX/*` → `fix(api):` commits

### Example Branch Names:

```bash
# Internal development (JIRA)
feature/RI-123/add-user-profile
bugfix/RI-456/fix-memory-leak
fe/feature/RI-789/add-dark-mode
be/bugfix/RI-234/fix-redis-connection

# Open source contributions (GitHub)
feature/123/add-export-feature
bugfix/456/fix-connection-timeout
fe/feature/789/improve-accessibility
be/bugfix/234/handle-edge-case
```

## Interactive Commit Message Generation

When asked to generate a commit message:

1. **Analyze changes** comprehensively
2. **Determine appropriate scope** (api/ui/desktop/etc.)
3. **Determine appropriate type** (feat/fix/refactor/etc.)
4. **Check for issue/ticket references** in branch name or context
5. **Craft clear, concise description**
6. **Present in easy-to-copy format**:

Example output for internal development:

```markdown
Based on the uncommitted changes, here's your commit message:

\`\`\`
feat(api): add user authentication with OAuth 2.0

Implements OAuth 2.0 authentication flow with token
management and refresh token support.

References: #RI-123
\`\`\`

This covers the addition of OAuth integration, login flow,
and token management across 8 modified API files.
```

Example output for open source contribution:

```markdown
Based on the uncommitted changes, here's your commit message:

\`\`\`
fix(ui): prevent memory leak in connection monitor

Properly cleanup subscriptions and timers when
component unmounts.

Fixes #456
\`\`\`

This resolves the memory leak issue reported in GitHub.
```

If changes span multiple scopes:

```markdown
I notice changes in both API and UI. I recommend two commits:

**Commit 1 (API changes):**
\`\`\`
feat(api): add OAuth 2.0 authentication endpoints

References: #RI-123
\`\`\`

**Commit 2 (UI changes):**
\`\`\`
feat(ui): add OAuth login interface

References: #RI-123
\`\`\`
```

## Quick Reference

| Type     | Scope          | When to Use      | Example                                    |
| -------- | -------------- | ---------------- | ------------------------------------------ |
| feat     | api/ui/desktop | New feature      | `feat(ui): add export to PDF`              |
| fix      | api/ui/desktop | Bug fix          | `fix(ui): correct tooltip position`        |
| refactor | api/ui/desktop | Code improvement | `refactor(api): simplify validation logic` |
| chore    | deps/config    | Maintenance      | `chore(deps): update dependencies`         |
| docs     | api/ui         | Documentation    | `docs(api): add endpoint examples`         |
| test     | e2e/ui/api     | Tests            | `test(e2e): add integration tests`         |
| style    | ui/api         | Formatting       | `style(ui): fix indentation`               |
| perf     | ui/api         | Performance      | `perf(api): cache responses`               |
| ci       | -              | CI/CD            | `ci: update GitHub Actions`                |

## Remember

- **Always include scope** - Makes it clear what part of the codebase changed
- **Reference issues/tickets** - Use `Fixes #RI-XXX` or `Fixes #XXX` in commit body
- **Quality over speed** - Take time to write meaningful messages
- **Future developers** will read these - make them helpful
- **Git history** is documentation - keep it clean and clear
- **One scope per commit** - Split multi-scope changes into separate commits
- **Match branch type** - `bugfix/*` → `fix(scope):`, `feature/*` → `feat(scope):`
- **Support both tracking systems** - JIRA (#RI-XXX) for internal, GitHub (#XXX) for open source
