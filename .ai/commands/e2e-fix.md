---
description: Run E2E tests and fix any failures
argument-hint: <test-pattern>
---

# Fix E2E Tests

Run E2E tests matching a pattern, analyze failures, and fix them.

**Follow all standards in `.ai/rules/e2e-testing.md`**

## Input

**Test pattern** (required) - Test name or describe block pattern
- Examples: `"Analytics > Slow Log"`, `"should add string key"`, `"@smoke"`

## Process

### Step 1: Run the Tests

```bash
cd tests/e2e-v2
npx playwright test --grep "<pattern>" --reporter=list 2>&1 | tail -50
```

### Step 2: Analyze Failures

If tests fail, check the error context file:

```bash
cat test-results/<test-folder>/error-context.md | head -150
```

The error context contains:
- **Page snapshot** - Current UI state (element tree with refs)
- **Error message** - What assertion failed
- **Call log** - Playwright's action log

### Step 3: Diagnose the Issue

Common failure patterns:

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `element(s) not found` | Wrong selector or element not rendered | Check snapshot for correct testid/role |
| `Timeout waiting for` | Element takes too long to appear | Add proper wait or check if element exists |
| `expected visible` | Element hidden or removed | Verify UI flow, check if dialog closed |
| `not.toBeVisible failed` | Element still visible | Wait for element to be removed |

### Step 4: Explore UI if Needed

If the error context doesn't reveal the issue, use Playwright MCP to explore:

```
browser_navigate_Playwright → http://localhost:8080
browser_snapshot_Playwright
browser_click_Playwright → element, ref
```

### Step 5: Fix the Test

Apply fixes following these priorities:

1. **Fix selectors** - Use correct `data-testid` or role from snapshot
2. **Fix waits** - Replace `waitForTimeout` with proper element waits
3. **Fix test data** - Ensure unique prefixes to avoid conflicts with other tests
4. **Fix assertions** - Match actual UI behavior

### Step 6: Verify the Fix

```bash
cd tests/e2e-v2
npx playwright test --grep "<pattern>" --reporter=list 2>&1 | tail -30
```

### Step 7: Run Linter and Type Check

**REQUIRED before completing:**

```bash
cd tests/e2e-v2
npm run lint && npx tsc --noEmit
```

Both must pass.

## Debugging Tips

### Check Page Snapshot for Correct Selectors

```yaml
# Look for data-testid in the snapshot
- button "Add" [ref=e123] [cursor=pointer]    # Use getByRole('button', { name: 'Add' })
- generic "my-testid" [ref=e456]              # Use getByTestId('my-testid')
- treeitem "String keyname..." [ref=e789]     # Use getByRole('treeitem', { name: /keyname/ })
```

### Handle View Mode Differences

Browser page has List view and Tree view with different element structures:

```typescript
// List view uses gridcell
page.getByRole('gridcell', { name: keyName })

// Tree view uses treeitem  
page.getByRole('treeitem', { name: new RegExp(keyName) })

// KeyList.getKeyRow() handles both
```

### Test Isolation Issues

If test fails inconsistently, check for:
- Missing unique suffix in test data (conflicts with parallel runs)
- Missing cleanup in `afterEach`
- Shared state between tests (use `test.describe.serial` if needed)

### Dropdown/Dialog Issues

If clicking fails after interacting with dropdown:
```typescript
// Close dropdown before next action
await page.keyboard.press('Escape');
```

## Example Usage

```
@e2e-fix "Analytics > Slow Log"
@e2e-fix "should add string key"
@e2e-fix "Browser > Key Details > String"
@e2e-fix "@smoke"
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npx playwright test --grep "pattern"` | Run matching tests |
| `npx playwright test --grep "pattern" --debug` | Run with inspector |
| `npx playwright show-trace <trace.zip>` | View test trace |
| `npm run lint` | Check for lint errors |
| `npx tsc --noEmit` | Check for type errors |

