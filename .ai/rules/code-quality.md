---
alwaysApply: true
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
- `apiClient` → `redisinsight/api-client` (auto-generated OpenAPI types — the typed entry point both the UI and the desktop main process use to consume BE-defined shapes)
- `desktopSrc/*` → `redisinsight/desktop/src/*` (desktop workspace)

The UI workspace must not import from the backend codebase directly. Use `apiClient` for types and the existing service layer (`uiSrc/services`) for HTTP calls.

The desktop workspace consumes BE shapes through three distinct lenses, each chosen for a specific reason:
- `apiClient` for types that exist on the REST surface (same as the UI consumes them).
- `apiSrc/*` (TypeScript paths alias to `redisinsight/api/src/*`) for plain BE classes the desktop subclasses or instantiates directly (`AbstractWindowAuthStrategy`, exception classes). These need real type info but don't participate in NestJS DI, so getting them through tsconfig paths is fine and keeps full type safety.
- Explicit `../../api/dist/src/*` paths for NestJS DI surfaces (`@Module`-decorated classes, services looked up via `beApp.select(...).get(...)`, the `server` bootstrap function). These MUST be the same compiled artifact the running api registers; importing them from source would produce a second compiled copy and break DI lookups.

This split is the only place a non-API workspace reaches into `redisinsight/api/`.

✅ **Use aliases**: `import { Button } from 'uiSrc/components/Button'`  
❌ **Avoid relative**: `import { Button } from '../../../ui/src/components/Button'`

## Naming Conventions

- **Components**: `PascalCase` - `UserProfile`
- **Functions/Variables**: `camelCase` - `fetchUserProfile`
- **Constants**: `UPPER_SNAKE_CASE` - `MAX_RETRY_ATTEMPTS`
- **Booleans**: Use `is/has/should` prefix - `isLoading`, `hasError`

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
- [ ] Vite cache cleared (if updated dependencies)
