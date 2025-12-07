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

- `feature/` - New features and refactoring (affects multiple areas)
- `bugfix/` - Bug fixes (affects multiple areas)
- `fe/feature/` - Frontend-only features (only `garnetinsight/ui/` folder)
- `fe/bugfix/` - Frontend-only bug fixes (only `garnetinsight/ui/` folder)
- `be/feature/` - Backend-only features (only `garnetinsight/api/` folder)
- `be/bugfix/` - Backend-only bug fixes (only `garnetinsight/api/` folder)
- `docs/` - Documentation changes
- `test/` - Test-related changes
- `e2e/` - End-to-end test changes
- `release/` - Release branches
- `ric/` - Custom prefix for special cases

**Note:** When a bug fix affects only the `garnetinsight/ui/` folder, use `fe/bugfix/` prefix instead of `bugfix/`.

## Issue References

- **Internal**: `RI-XXX` (JIRA ticket)
- **Open Source**: `XXX` (GitHub issue number)
- Use `#` only in commit messages, not branch names
