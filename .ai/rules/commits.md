---
alwaysApply: true
---

# Commit Message Guidelines

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `docs` - Documentation changes
- `chore` - Maintenance tasks
- `style` - Code style changes (formatting)
- `perf` - Performance improvements
- `ci` - CI/CD changes

## Examples

```bash
feat(ui): add user search functionality

Implements real-time search with debouncing.

References: #RI-123

---

fix(api): resolve memory leak in connection pool

Properly cleanup subscriptions on unmount.

Fixes #456

---

test(ui): add tests for data serialization

refactor(api): extract common validation logic

docs: update API endpoint documentation

chore: upgrade React to version 18.2
```

## Best Practices

### ✅ Good Commits

- Clear, descriptive subject line
- Atomic changes (one logical change per commit)
- Reference issue/ticket in body
- Explain **why**, not just **what**
- **Keep it concise** - Don't list every file change in the body

```bash
feat(ui): add user profile editing

Allows users to update their profile information including
name, email, and avatar. Includes validation and error handling.

References: #RI-123
```

### ❌ Bad Commits

```bash
# Too vague
fix stuff
WIP
update

# Too broad
add feature, fix bugs, refactor code, update tests
```

## Issue References

- **JIRA (internal)**: `References: #RI-123` or `Fixes #RI-123`
- **GitHub (open source)**: `Fixes #456` or `Closes #456`
- Use `#` for auto-linking in commit messages
