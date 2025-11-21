# Development Workflow and Git Practices

## Git Workflow

### Branch Naming

Use lowercase kebab-case with type prefix and issue/ticket identifier:

```bash
# Pattern: <type>/<issue-ref>/<short-title>

# INTERNAL DEVELOPMENT (JIRA Tickets - #RI-XXX)
# Feature branches
feature/RI-123/add-user-profile
feature/RI-456/redis-cluster-support

# Bug fixes
bugfix/RI-789/memory-leak-connections
bugfix/RI-234/ui-rendering-issue

# Frontend-only features
fe/feature/RI-567/add-dark-mode
fe/feature/RI-890/user-profile-editor

# Backend-only fixes
be/bugfix/RI-345/update-databases-api
be/bugfix/RI-678/fix-redis-connection

# OPEN SOURCE CONTRIBUTIONS (GitHub Issues - XXX)
# Feature branches
feature/123/add-export-feature
feature/456/improve-performance

# Bug fixes
bugfix/789/fix-connection-timeout
bugfix/234/handle-edge-case

# Frontend-only features
fe/feature/567/improve-accessibility
fe/feature/890/add-keyboard-shortcuts

# Backend-only fixes
be/bugfix/#345/fix-cluster-discovery
be/bugfix/#678/handle-connection-error

# Hotfixes (no ticket required for critical production issues)
hotfix/critical-security-patch

# Refactoring
refactor/RI-111/extract-redis-service
refactor/222/simplify-validation

# Documentation
docs/RI-333/update-api-documentation
docs/444/improve-readme

# Chores/maintenance
chore/RI-555/upgrade-dependencies
chore/666/update-ci-pipeline
chore/update-eslint-config  # Can omit ticket for minor maintenance
```

**Where:**

- `RI-XXX` = JIRA ticket number (e.g., RI-123) - for internal development
- `XXX` = GitHub issue number (e.g., 456) - for open source contributions
- Note: Use `#` only in commit message references (e.g., `Fixes #456`), not in branch names

### Commit Messages

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `style`: Code style changes (formatting, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples:**

```bash
feat(ui): add user profile editing interface

fix(api): resolve memory leak in Redis connection pool

test(ui): add tests for data serialization

refactor(api): extract common validation logic to utility

docs: update API endpoint documentation

chore: upgrade React to version 18.2

perf(ui): optimize list rendering with virtualization

style(api): fix import order and formatting
```

### Commit Best Practices

```bash
# ✅ GOOD: Atomic commits with clear messages and references
git commit -m "feat(ui): add user search functionality

Implements real-time search with debouncing and
result highlighting.

References: #RI-123"

git commit -m "test(ui): add tests for user search"

git commit -m "docs: update user search documentation"

# ✅ GOOD: Open source contribution with GitHub issue
git commit -m "fix(ui): prevent memory leak in connection monitor

Properly cleanup subscriptions and timers when
component unmounts.

Fixes #456"

# ✅ GOOD: Descriptive subject with body for complex changes
git commit -m "fix(api): resolve race condition in connection pool

The connection pool was not properly handling concurrent requests,
leading to connection leaks. This fix adds proper locking mechanism
and increases the timeout for connection acquisition.

Fixes #RI-123"

# ❌ BAD: Vague messages
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "update"

# ❌ BAD: Too many changes in one commit
git commit -m "add feature, fix bugs, refactor code, update tests"

# ❌ BAD: Missing issue reference in body
git commit -m "feat(ui): add new feature"  # Should include References: #RI-XXX or Fixes #XXX
```

### Branch Management

```bash
# Create feature branch from main (Internal - JIRA)
git checkout main
git pull origin main
git checkout -b feature/RI-123/my-feature

# Create feature branch from main (Open Source - GitHub)
git checkout main
git pull origin main
git checkout -b feature/456/my-feature

# Keep branch up to date
git fetch origin
git rebase origin/main

# Push branch (JIRA)
git push origin feature/RI-123/my-feature

# Push branch (GitHub)
git push origin feature/456/my-feature

# ❌ NEVER: Force push to main/master
git push --force origin main  # DON'T DO THIS!

# ✅ ACCEPTABLE: Force push to feature branch (after rebase)
git push --force-with-lease origin feature/RI-123/my-feature
git push --force-with-lease origin feature/456/my-feature
```

## Development Workflow

### Before Starting Work

1. **Pull latest changes**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**

   ```bash
   # Internal development (JIRA)
   git checkout -b feature/RI-123/description

   # Open source contribution (GitHub)
   git checkout -b feature/456/description
   ```

3. **Understand requirements**
   - Read JIRA ticket (RI-XXX) or GitHub issue (XXX) thoroughly
   - Clarify ambiguous requirements
   - Identify dependencies
   - Plan implementation approach

### During Development

1. **Write code following established patterns**

   - Follow code style guidelines
   - Use proper TypeScript types
   - Add comments only when necessary
   - Keep functions small and focused

2. **Add/update tests as you go**

   - Write tests alongside code
   - Aim for >80% coverage
   - Test edge cases and error scenarios

3. **Run linter frequently**

   ```bash
   yarn lint
   ```

4. **Check TypeScript types**

   ```bash
   yarn type-check:ui
   ```

5. **Test locally**

   ```bash
   yarn test
   yarn test:api
   ```

6. **Commit regularly**
   - Make atomic commits
   - Write clear commit messages
   - Don't wait until end of day

### Before Committing

**CRITICAL CHECKLIST** - Run these commands before every commit:

1. **Run linter**

   ```bash
   yarn lint
   # Or scoped:
   yarn lint:ui
   yarn lint:api
   ```

2. **Run all tests**

   ```bash
   yarn test
   yarn test:api
   ```

3. **Check test coverage**

   ```bash
   yarn test:cov
   ```

4. **Verify TypeScript compilation**

   ```bash
   yarn type-check:ui
   ```

5. **Format code**
   ```bash
   yarn prettier:fix
   ```

### Before Creating PR

1. **Rebase on main**

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run full test suite**

   ```bash
   yarn test && yarn test:api
   ```

3. **Verify no linting errors**

   ```bash
   yarn lint
   ```

4. **Build locally**

   ```bash
   yarn build:ui
   yarn build:api
   ```

5. **Self-review your changes**
   - Check diff for debug code
   - Remove console.log statements
   - Verify all tests pass
   - Check for commented-out code

## Pull Request Process

### Creating PR

1. **Write clear PR title**

   ```
   # Internal development (JIRA)
   feat(ui): Add user profile editing

   [RI-1234] Add user profile editing interface

   # Open source contribution (GitHub)
   feat(ui): Add user profile editing

   [#456] Add user profile editing interface
   ```

2. **Complete PR description**

   ```markdown
   ## Description

   Implements user profile editing functionality including name, email, and avatar.

   ## Changes

   - Added UserProfileEdit component
   - Created API endpoints for profile updates
   - Added validation with Formik
   - Added unit and integration tests

   ## Testing

   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   - [ ] E2E tests added

   ## Screenshots

   [Include screenshots for UI changes]

   ## Related Issues

   # For internal development:

   Closes #RI-123
   Related to #RI-456

   # For open source contributions:

   Closes #123
   Fixes #456

   # Can reference both if applicable:

   Closes #123
   Related to #RI-789
   ```

3. **Request reviewers**
   - Add appropriate team members
   - Consider domain experts

### PR Review Guidelines

**As Author:**

- Respond to all comments
- Don't take feedback personally
- Explain your reasoning
- Update code based on feedback
- Mark resolved conversations

**As Reviewer:**

- Be constructive and respectful
- Focus on code quality, not style (linter handles that)
- Check for:
  - Logic errors
  - Edge cases
  - Performance issues
  - Security concerns
  - Test coverage
  - Documentation

### After PR Approval

1. **Squash and merge** (preferred for feature branches)
2. **Rebase and merge** (for clean history)
3. **Merge commit** (for long-lived branches)

4. **Delete feature branch**
   ```bash
   git branch -d feature/RI-123/my-feature
   git push origin --delete feature/RI-123/my-feature
   ```

## Common Development Commands

### Development

```bash
# Start UI development server (Vite)
yarn dev:ui

# Start API development server (NestJS)
yarn dev:api

# Start full Electron application
yarn dev:desktop

# Start Electron with UI and API
yarn dev:desktop  # Runs all three concurrently
```

### Building

```bash
# Build UI for production
yarn build:ui

# Build API for production
yarn build:api

# Build entire application
yarn build:prod

# Build for staging
yarn build:stage

# Build static assets
yarn build:statics
```

### Testing

```bash
# Run UI tests
yarn test

# Run UI tests in watch mode
yarn test:watch

# Run UI tests with coverage
yarn test:cov

# Run unit tests only
yarn test:cov:unit

# Run component tests only
yarn test:cov:component

# Run API tests
yarn test:api

# Run API integration tests
yarn test:api:integration
```

### Code Quality

```bash
# Lint all code
yarn lint

# Lint UI only
yarn lint:ui

# Lint API only
yarn lint:api

# Lint E2E tests
yarn lint:e2e

# Check code formatting
yarn prettier

# Fix code formatting
yarn prettier:fix

# TypeScript type checking
yarn type-check:ui
```

### Package Management

```bash
# Install dependencies
yarn

# Add dependency
yarn add package-name

# Add dev dependency
yarn add -D package-name

# Remove dependency
yarn remove package-name

# Update dependencies
yarn upgrade

# Clean install
rm -rf node_modules yarn.lock
yarn
```

## Environment Setup

### Required Tools

- Node.js >= 22.x
- Yarn >= 1.21.3
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/RedisInsight/RedisInsight.git
cd RedisInsight

# Install dependencies
yarn

# Run postinstall scripts
# This runs automatically, but can be triggered manually:
yarn postinstall
```

### IDE Setup

**VS Code (Recommended extensions):**

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Jest Runner
- GitLens

**Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Troubleshooting

### Common Issues

**Linting errors after pulling main:**

```bash
yarn prettier:fix
yarn lint
```

**Type errors:**

```bash
yarn type-check:ui
# Fix reported errors
```

**Tests failing:**

```bash
# Clear Jest cache
yarn test --clearCache

# Run specific test
yarn test path/to/test.spec.ts
```

**Build errors:**

```bash
# Clean and rebuild
rm -rf node_modules dist
yarn
yarn build:prod
```

**Port already in use:**

```bash
# Find and kill process using port 5540 (API)
lsof -i :5540
kill -9 <PID>

# Or use different port
RI_APP_PORT=5541 yarn dev:api
```

## Best Practices Summary

### DO:

- ✅ Pull main before starting work
- ✅ Create feature branches with issue/ticket number:
  - Internal: `feature/RI-123/description`
  - Open source: `feature/456/description`
- ✅ Write clear, descriptive commit messages with scope
- ✅ Reference issues/tickets in commit body:
  - JIRA: `Fixes #RI-123`
  - GitHub: `Fixes #456` (with `#` for auto-linking)
- ✅ Run linter and tests before committing
- ✅ Keep commits atomic and focused
- ✅ Request code reviews
- ✅ Respond to review feedback promptly
- ✅ Update documentation with code changes
- ✅ Delete branches after merging
- ✅ Include issue reference in PR (Closes #RI-XXX or Closes #XXX)

### DON'T:

- ❌ Commit directly to main/master
- ❌ Force push to main/master
- ❌ Skip pre-commit checks
- ❌ Make large commits with multiple unrelated changes
- ❌ Ignore linting errors
- ❌ Skip writing tests
- ❌ Leave debug code in commits
- ❌ Use vague commit messages
- ❌ Bypass git hooks (--no-verify)

## Workflow Checklist

**Starting new feature:**

- [ ] Pull latest main
- [ ] Create feature branch with issue/ticket: `feature/RI-XXX/<description>` or `feature/XXX/<description>`
- [ ] Understand requirements (read JIRA ticket #RI-XXX or GitHub issue #XXX)

**During development:**

- [ ] Follow code style guidelines
- [ ] Write tests alongside code
- [ ] Run linter frequently
- [ ] Make atomic commits

**Before committing:**

- [ ] `yarn lint` passes
- [ ] `yarn test && yarn test:api` passes
- [ ] `yarn type-check:ui` passes
- [ ] No console.log statements
- [ ] No commented-out code

**Before creating PR:**

- [ ] Rebase on main
- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Self-reviewed changes
- [ ] PR description complete

**After PR approved:**

- [ ] Merge PR
- [ ] Delete feature branch
- [ ] Pull updated main
- [ ] Verify in production/staging
