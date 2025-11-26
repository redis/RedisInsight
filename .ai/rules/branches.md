---
alwaysApply: true
---

# Branch Naming Conventions

Use lowercase kebab-case with type prefix and issue/ticket identifier:

```bash
# Pattern: <type>/<issue-ref>/<short-title>

# INTERNAL (JIRA - RI-XXX)
feature/RI-123/add-user-profile
bugfix/RI-789/memory-leak
fe/feature/RI-567/add-dark-mode
be/bugfix/RI-345/fix-redis-connection

# OPEN SOURCE (GitHub - XXX)
feature/123/add-export-feature
bugfix/789/fix-connection-timeout

# Other types
hotfix/critical-security-patch
refactor/RI-111/extract-service
docs/RI-333/update-docs
chore/RI-555/upgrade-deps
```

## Branch Types

- `feature/` - New features
- `bugfix/` - Bug fixes
- `fe/feature/` - Frontend-only features
- `be/bugfix/` - Backend-only fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `chore/` - Maintenance tasks

## Issue References

- **Internal**: `RI-XXX` (JIRA ticket)
- **Open Source**: `XXX` (GitHub issue number)
- Use `#` only in commit messages, not branch names
