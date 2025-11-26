---
alwaysApply: true
---

# Branch Naming Conventions

Use lowercase kebab-case with type prefix and issue/ticket identifier. **Branch names must match GitHub Actions workflow rules** (see `.github/workflows/enforce-branch-name-rules.yml`).

```bash
# Pattern: <type>/<issue-ref>/<short-title>

# INTERNAL (JIRA - RI-XXX)
feature/RI-123/add-user-profile
bugfix/RI-789/memory-leak
fe/feature/RI-567/add-dark-mode
be/bugfix/RI-345/fix-redis-connection
docs/RI-333/update-docs
test/RI-444/add-unit-tests
e2e/RI-555/add-integration-tests

# OPEN SOURCE (GitHub - XXX)
feature/123/add-export-feature
bugfix/789/fix-connection-timeout

# Special branches
release/v2.0.0
ric/RI-666/custom-prefix
```

## Allowed Branch Types (GitHub Actions Enforced)

- `feature/` - New features and refactoring
- `bugfix/` - Bug fixes
- `fe/feature/` - Frontend-only features
- `fe/bugfix/` - Frontend-only bug fixes
- `be/feature/` - Backend-only features
- `be/bugfix/` - Backend-only bug fixes
- `docs/` - Documentation changes
- `test/` - Test-related changes
- `e2e/` - End-to-end test changes
- `release/` - Release branches
- `ric/` - Custom prefix for special cases

## Issue References

- **Internal**: `RI-XXX` (JIRA ticket)
- **Open Source**: `XXX` (GitHub issue number)
- Use `#` only in commit messages, not branch names
