---
name: code-quality
description: >-
  Code-quality standards for RedisInsight: TypeScript strictness,
  naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE),
  linting rules, no `any` without reason, no `!important` in styles,
  and constant extraction. Use when writing or refactoring any
  TypeScript/JavaScript code in this repo, when ESLint or Prettier
  issues come up, or when the user mentions code style, lint, naming
  conventions, or general code quality.
---


# Code Quality Standards

## Critical Rules

- **ALWAYS run linter** after code changes: `yarn lint`
- Linter must pass before committing
- No console.log in production code (use console.warn/error only)

## TypeScript Standards

### Essential Rules

- Use TypeScript for all new code
- **Avoid `any`** - use proper types or `unknown`
- **Prefer interfaces** for object shapes
- Use **type** for unions, intersections, primitives
- Add explicit return types for non-obvious functions
- Leverage type inference where clear

## Import Organization

### Required Order (enforced by ESLint)

1. External libraries (`react`, `lodash`, etc.)
2. Built-in Node modules (`path`, `fs` - backend only)
3. Internal modules with aliases (`uiSrc/*`, `apiClient`)
4. Sibling/parent relative imports
5. Style imports (ALWAYS LAST)

### Module Aliases

- `uiSrc/*` → `redisinsight/ui/src/*` (UI workspace)
- `apiClient` → `redisinsight/api-client` (auto-generated OpenAPI types — the UI's only entry point into BE-defined shapes)
- `desktopSrc/*` → `redisinsight/desktop/src/*` (desktop workspace)

The UI workspace must not import from the backend codebase directly. Use `apiClient` for types and the existing service layer (`uiSrc/services`) for HTTP calls.

✅ **Use aliases**: `import { Button } from 'uiSrc/components/Button'`  
❌ **Avoid relative**: `import { Button } from '../../../ui/src/components/Button'`

## Naming Conventions

- **Components**: `PascalCase` - `UserProfile`
- **Functions/Variables**: `camelCase` - `fetchUserProfile`
- **Constants**: `UPPER_SNAKE_CASE` - `MAX_RETRY_ATTEMPTS`
- **Booleans**: Use `is/has/should` prefix - `isLoading`, `hasError`

## Comments

**Default to fewer comments.** Clear names, small functions, and good
tests should carry the meaning. Write a comment only when the code
genuinely can't explain itself — or when the user explicitly asks for
more (for example, on a piece of complex logic).

When you do write one, keep it short and use plain words to say
**what** the code is doing or **why** it has to exist — not how it
works under the hood, and not the story of why you made the change
(that belongs in the commit message or PR description).

✅ **Good** — plain, names the situation:

```ts
// When switching keys, hide the previous key's loader/error/result
// until the new key is ready.
const showLoader = isArrayKeyReady && loading
```

❌ **Avoid** — long, mechanism-heavy, re-derives what the code shows:

```ts
// Gate every aggregate-slice surface (loader, error, result) on
// `isArrayKeyReady`: when the user switches keys, `keyProp` flips
// immediately but `selectedKeyData` lags by a round-trip, so the
// prior key's slice state would otherwise paint under the newly
// selected (or empty) key for one frame before the hook's reset
// effect fires.
const showLoader = isArrayKeyReady && loading
```

Also avoid:

- Restating identifier names in prose (`// set loading to true`).
- Comments that duplicate what a clearly-named test already asserts.
- Block comments that summarize obvious blocks (`// loop over items`).

## SonarJS Rules

- Keep cognitive complexity low (refactor complex functions)
- Extract duplicate strings to constants
- Follow DRY principle - no duplicate code
- Use immediate return (avoid unnecessary intermediate variables)

## Best Practices

- Use destructuring for objects and arrays
- Use template literals over string concatenation
- Use `const` by default, `let` only when reassignment needed
- Use descriptive variable names
- Handle errors properly
- Clean up subscriptions and timers
- Use constants instead of magic numbers

## Vite Cache Management

When updating npm packages (especially `@redis-ui/*` packages):

1. **Clear Vite cache** after `yarn install`:

   ```bash
   rm -rf node_modules/.vite
   rm -rf redisinsight/ui/node_modules/.vite
   ```

2. **Restart dev server** to rebuild dependencies

3. This ensures new package versions are properly loaded

## Pre-Commit Checklist

- [ ] `yarn lint` passes
- [ ] No TypeScript errors
- [ ] Import order is correct
- [ ] No `any` types without reason
- [ ] No console.log statements
- [ ] No magic numbers
- [ ] Descriptive variable names
- [ ] Low cognitive complexity
- [ ] No duplicate code
- [ ] Comments kept to a minimum; any present are short and plain-language
- [ ] Vite cache cleared (if updated dependencies)
