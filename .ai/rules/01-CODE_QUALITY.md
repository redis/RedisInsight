# Code Quality Standards

## Linting and Formatting

### Critical Rules

- **ALWAYS run linter after code changes**: `yarn lint` or `yarn lint:ui` / `yarn lint:api`
- Linter must pass before committing
- Follow ESLint Airbnb config with project-specific overrides
- Use Prettier for code formatting
- No console.log in production code (use console.warn/error only)

### ESLint Configuration

- **UI**: Airbnb TypeScript + React + SonarJS
- **API**: Airbnb TypeScript Base + SonarJS
- **Cognitive Complexity Limits**:
  - Backend/API: ≤ 15
  - Frontend/UI: ≤ 20
- **Max Line Length**: 120 characters

### Prettier Rules

```javascript
{
  "semi": true,  // Semicolons for .js files
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "options": {
        "semi": false  // NO semicolons for TypeScript
      }
    }
  ]
}
```

### Code Style Examples

```typescript
// ✅ GOOD: No semicolons in TypeScript
const value = 'test';
const result = doSomething();

// ✅ GOOD: Proper typing
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<UserProfile> => {
  // Implementation
};

// ❌ BAD: Semicolons in TypeScript
const value = 'test';

// ❌ BAD: Using any without justification
const data: any = {};

// ❌ BAD: Magic numbers
const result = items.filter((x) => x.v > 100);

// ✅ GOOD: Named constants
const MIN_THRESHOLD = 100;
const result = items.filter((item) => item.value > MIN_THRESHOLD);
```

## TypeScript Standards

### Type Usage

- Use TypeScript for **all new code** (no .js files unless required)
- Use **explicit return types** for functions when non-obvious
- **Prefer interfaces** over types for object shapes
- Use proper typing, **avoid `any`** unless absolutely necessary
- Leverage **type inference** where it improves readability
- Use **generics** for reusable components/functions

### Interface vs Type

```typescript
// ✅ PREFERRED: Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ OK: Type for unions, intersections, primitives
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;

// ✅ GOOD: Generic types
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}
```

### Type Safety

```typescript
// ✅ GOOD: Proper typing
const parseData = (input: string): ParsedData => {
  const result = JSON.parse(input);
  return result as ParsedData;
};

// ✅ GOOD: Type guards
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// ❌ BAD: Too many any types
const processData = (data: any): any => {
  return data.map((item: any) => item.value);
};
```

## Import Organization

### Import Order (Enforced by ESLint)

1. **External libraries** (e.g., `react`, `lodash`)
2. **Built-in Node modules** (e.g., `path`, `fs`)
3. **Internal modules** (using aliases)
4. **Sibling/parent imports**
5. **Index imports**
6. **Style imports** (`.scss`) - **ALWAYS LAST**

### Example

```typescript
// 1. External libraries
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { some, debounce } from 'lodash';

// 2. Built-in Node modules (backend only)
import * as path from 'path';
import * as fs from 'fs';

// 3. Internal modules (use aliases)
import { fetchData } from 'uiSrc/services/api';
import { formatDate } from 'uiSrc/utils/formatters';

// 4. Sibling/parent imports
import { Component } from './Component';
import { helper } from '../utils/helper';

// 5. Styles - ALWAYS LAST
import styles from './Component.module.scss';
```

### Module Aliases

Always use module aliases for cross-module imports:

- `uiSrc/*` → `redisinsight/ui/src/*`
- `apiSrc/*` → `redisinsight/api/src/*`
- `desktopSrc/*` → `redisinsight/desktop/src/*`

```typescript
// ✅ GOOD: Use aliases
import { UserService } from 'apiSrc/services/user';
import { Button } from 'uiSrc/components/Button';

// ❌ BAD: Relative paths across modules
import { UserService } from '../../../api/src/services/user';
```

## SonarJS Rules

### Complexity Rules

- **Cognitive Complexity**: Keep functions simple and readable
  - Backend: ≤ 15
  - Frontend: ≤ 20
- **No Duplicate Strings**: Extract repeated strings to constants
- **No Identical Functions**: Follow DRY principle
- **Prefer Immediate Return**: Avoid unnecessary intermediate variables

### Examples

```typescript
// ✅ GOOD: Low complexity
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ GOOD: Extract constants
const ERROR_MESSAGES = {
  NOT_FOUND: 'Entity not found',
  INVALID_INPUT: 'Invalid input provided',
  UNAUTHORIZED: 'Unauthorized access',
};

throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);

// ✅ GOOD: Immediate return
const isValid = (value: string): boolean => {
  return value.length > 0 && value.length < 100;
};

// ❌ BAD: Unnecessary variable
const isValid = (value: string): boolean => {
  const result = value.length > 0 && value.length < 100;
  return result;
};
```

## Code Organization

### File Structure

```typescript
// 1. Imports (in proper order)
import React from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from 'uiSrc/utils';
import styles from './Component.module.scss';

// 2. Types/Interfaces
interface Props {
  id: string;
  name: string;
}

interface State {
  loading: boolean;
}

// 3. Constants
const MAX_ITEMS = 100;
const DEFAULT_TIMEOUT = 5000;

// 4. Component/Function implementation
export const Component: FC<Props> = ({ id, name }) => {
  // Implementation
};

// 5. Helper functions (if small and local)
const formatName = (name: string): string => {
  return name.trim().toLowerCase();
};
```

### Naming Conventions

```typescript
// ✅ GOOD: Descriptive names
const fetchUserProfile = async (userId: string) => {};
const isValidEmail = (email: string): boolean => {};
const MAX_RETRY_ATTEMPTS = 3;

// ❌ BAD: Unclear names
const getData = async (id: string) => {};
const check = (val: string): boolean => {};
const MAX = 3;

// ✅ GOOD: Component names (PascalCase)
export const UserProfile: FC<Props> = () => {};

// ✅ GOOD: Boolean variables (is/has/should prefix)
const isLoading = true;
const hasError = false;
const shouldRetry = true;
```

## Best Practices

### Destructuring

```typescript
// ✅ GOOD: Use destructuring
const { name, email, age } = user;
const [first, second, ...rest] = items;

// ❌ BAD: Repetitive access
const name = user.name;
const email = user.email;
const age = user.age;
```

### Template Literals

```typescript
// ✅ GOOD: Template literals
const message = `Hello ${name}, you have ${count} messages`;

// ❌ BAD: String concatenation
const message = 'Hello ' + name + ', you have ' + count + ' messages';
```

### Const vs Let

```typescript
// ✅ GOOD: Use const by default
const userId = '123';
const items = [1, 2, 3];

// ✅ GOOD: Use let only when reassignment needed
let counter = 0;
counter += 1;

// ❌ BAD: Unnecessary let
let name = 'John'; // Never reassigned
```

### No Console.log

```typescript
// ❌ BAD: console.log in production
console.log('User data:', userData);

// ✅ GOOD: Use proper logging (backend)
this.logger.debug('User data', { userId: user.id });
this.logger.error('Failed to fetch user', error);

// ✅ GOOD: console.error/warn for errors (frontend)
console.error('API Error:', error);
console.warn('Deprecated method used');
```

## Common Pitfalls to Avoid

1. ❌ Using `any` type unnecessarily
2. ❌ Not cleaning up effects and subscriptions
3. ❌ Magic numbers and unclear variable names
4. ❌ Duplicate code (DRY violation)
5. ❌ High cognitive complexity
6. ❌ Console.log statements
7. ❌ Ignoring linter errors
8. ❌ Mutating objects directly (Redux)
9. ❌ Missing error handling
10. ❌ Unnecessary comments

## Verification Checklist

Before committing:

- [ ] `yarn lint` passes with no errors
- [ ] No TypeScript errors
- [ ] Import order is correct
- [ ] No `any` types without justification
- [ ] No console.log statements
- [ ] No magic numbers
- [ ] Variable names are descriptive
- [ ] Functions have low cognitive complexity
- [ ] No duplicate code
- [ ] Code is properly formatted
