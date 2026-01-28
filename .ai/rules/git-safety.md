# Git Safety Rules for AI Agents

## 🚫 CRITICAL: Protected Branch Rules

**AI agents must NEVER commit to or push to protected branches under any circumstances.**

### Protected Branches

- `main` - Primary production branch
- `latest` - Latest stable release
- `release/*` - Release branches (e.g., `release/v2.0.0`)

This is a non-negotiable rule that applies to all scenarios:

### Prohibited Actions

- ❌ **Direct commits** - Never run `git commit` while on a protected branch
- ❌ **Direct pushes** - Never run `git push origin <protected-branch>` or `git push` while on a protected branch
- ❌ **Force pushes** - Never run `git push --force` or `git push -f` targeting protected branches
- ❌ **Merging into protected branches locally** - Never run `git merge <branch>` while on a protected branch
- ❌ **Rebasing protected branches** - Never run `git rebase` while on a protected branch
- ❌ **Resetting protected branches** - Never run `git reset` while on a protected branch

### Required Workflow

1. **Always create a feature branch** before making any changes
2. **Verify current branch** before any git operation using `git branch --show-current`
3. **Create Pull Requests** for all changes - let the review process handle merging

### Pre-Push Checklist

Before executing any push command, AI agents must:

1. ✅ Confirm current branch is NOT a protected branch (`main`, `latest`, `release/*`)
2. ✅ Verify the remote and branch target

### Error Recovery

If accidentally on a protected branch with uncommitted changes:

1. Stash changes: `git stash`
2. Create new branch: `git checkout -b <appropriate-branch-name>`
3. Apply changes: `git stash pop`
4. Continue work on the new branch

## Rationale

- Protected branches represent production-ready or release code
- All changes must go through code review via Pull Requests
- Direct pushes bypass CI/CD checks and team review
- Mistakes on protected branches can affect the entire team and deployment pipeline

