# Commit Message Generation

Generate concise, meaningful commit messages following Garnetinsight conventions.

## Format

```
<type>(<scope>): <description>

[optional body]

References: #RI-XXX
```

## Types & Scopes

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`

**Scopes**: `api`, `ui`, `e2e`, `deps`

## Rules

**DO:**
- ✅ Always include scope: `feat(api):`, `fix(ui):`
- ✅ Use imperative mood: "add feature" not "added feature"
- ✅ Start with lowercase after scope
- ✅ Keep subject under 250 characters
- ✅ Inspect all uncommitted files before generating

**DON'T:**
- ❌ Omit scope
- ❌ Use past tense
- ❌ Add period at end
- ❌ Use multiple scopes (split into separate commits)

## Examples

```bash
feat(ui): add user profile editing
fix(api): resolve memory leak in connection pool
refactor(api): extract validation logic
test(e2e): add authentication tests
chore(deps): upgrade React to 18.2
```

## Issue References

**JIRA**: `References: #RI-123` or `Fixes #RI-123`
**GitHub**: `Fixes #123` or `Closes #123`

## Process

1. Run `git status && git diff`
2. Identify scope: API → `api`, UI → `ui`, Both → separate commits
3. Identify type: New → `feat`, Bug → `fix`, Improvement → `refactor`
4. Write description (what changed and why)
5. Add issue reference in body

## Multiple Scopes

Split into separate commits:

```bash
# ✅ Good
git commit -m "feat(api): add user endpoint

References: #RI-123"

git commit -m "feat(ui): add user interface

References: #RI-123"

# ❌ Bad
git commit -m "feat(api,ui): add user feature"
```

## Output Format

Present in copyable format:

```markdown
Based on the changes, here's your commit message:

\`\`\`
feat(api): add OAuth 2.0 authentication

Implements OAuth flow with token management
and refresh token support.

References: #RI-123
\`\`\`
```

If multiple scopes:

```markdown
Changes span multiple scopes. I recommend two commits:

**Commit 1:**
\`\`\`
feat(api): add OAuth endpoints

References: #RI-123
\`\`\`

**Commit 2:**
\`\`\`
feat(ui): add OAuth login interface

References: #RI-123
\`\`\`
```
