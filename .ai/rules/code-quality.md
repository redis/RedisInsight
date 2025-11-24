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
3. Internal modules with aliases (`uiSrc/*`, `apiSrc/*`)
4. Sibling/parent relative imports
5. Style imports (ALWAYS LAST)

### Module Aliases

- `uiSrc/*` → `redisinsight/ui/src/*`
- `apiSrc/*` → `redisinsight/api/src/*`
- `desktopSrc/*` → `redisinsight/desktop/src/*`

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
