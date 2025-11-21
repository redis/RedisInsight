# Frontend Development (React/Redux)

## Table of Contents

1. [Component Structure & Organization](#component-structure--organization)
2. [Styled Components](#styled-components)
3. [State Management (Redux)](#state-management-redux)
4. [React Best Practices](#react-best-practices)
5. [Custom Hooks](#custom-hooks)
6. [Form Handling](#form-handling)
7. [UI Components](#ui-components)
8. [Common Pitfalls](#common-pitfalls)

---

## Component Structure & Organization

### Functional Components

- Use **functional components with hooks** (no class components)
- **Prefer named exports** over default exports
- Keep components **focused and single-responsibility**
- Extract complex logic into **custom hooks** or utilities

### Component Folder Structure

**Note**: We are **migrating to styled-components** and deprecating SCSS modules.

Each component should be placed in its own directory under `**/ComponentName`. The directory should contain:

- `ComponentName.tsx` – The main component file
- `ComponentName.style.ts` – Styles using styled-components
- `ComponentName.types.ts` – TypeScript types and interfaces
- `ComponentName.test.tsx` – Test of the component
- `ComponentName.constants.ts` – All of the relevant constants of the component
- `ComponentName.story.tsx` - Storybook with examples how to use this component
- `/components` - Any sub components used within the main component
- `/hooks` - Any custom hooks used within the main component
- `/utils` - Any utility functions used within the main component

#### Example Structure

```
UserDetails/
  UserDetails.tsx
  UserDetails.style.ts
  UserDetails.types.ts
  UserDetails.test.tsx
  UserDetails.constants.ts
  hooks/
    useUserDetailsLogic.ts
  components/
    UserAddress/
      hooks/
        useUserAddressLogic.ts
      UserAddress.tsx
      UserAddress.style.ts
      UserAddress.types.ts
  utils/
    getUserFullName/
      getUserFullName.ts
      getUserFullName.test.ts
```

### Component Pattern

```typescript
// UserProfile.types.ts
export interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
}

export interface User {
  id: string
  name: string
  email: string
}

// UserProfile.constants.ts
export const ERROR_MESSAGES = {
  FETCH_ERROR: 'Failed to load user profile',
  UPDATE_ERROR: 'Failed to update user profile',
}

export const REFRESH_INTERVAL = 5000

// UserProfile.style.ts
import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
`

export const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`

// hooks/useUserProfile.ts
import { useState, useEffect } from 'react'
import { User } from '../UserProfile.types'
import { fetchUser } from 'uiSrc/services/api'

export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchUser(userId)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}

// UserProfile.tsx
import React, { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchUserData } from 'uiSrc/slices/user/thunks'
import { userSelector, loadingSelector } from 'uiSrc/slices/user/selectors'

import { UserProfileProps } from './UserProfile.types'
import { ERROR_MESSAGES } from './UserProfile.constants'
import { useUserProfile } from './hooks/useUserProfile'

import * as S from './UserProfile.style'

export const UserProfile: FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const dispatch = useDispatch()
  const { user, loading, error } = useUserProfile(userId)

  useEffect(() => {
    dispatch(fetchUserData(userId))

    // Cleanup
    return () => {
      // Cancel subscriptions, clear timers, etc.
    }
  }, [userId, dispatch])

  const handleSave = useCallback(() => {
    // Handler logic
    onUpdate?.(user)
  }, [user, onUpdate])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{ERROR_MESSAGES.FETCH_ERROR}</div>
  if (!user) return null

  return (
    <S.Container>
      <S.Title>{user.name}</S.Title>
      <p>{user.email}</p>
    </S.Container>
  )
}
```

### Props Interface Naming

- Name component props interface as `ComponentNameProps`
- Use separate interfaces for complex prop objects
- Always use proper TypeScript types, never `any`

#### ✅ Good

```tsx
// ComponentName.types.ts
export interface ComponentNameProps {
  required: string;
  optional?: number;
  callback: (id: string) => void;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
}
```

### Use Clear and Descriptive Prop Names

#### ✅ Good

```tsx
<HeaderBar title={title} price={price} priceUnit={unit} />
```

#### ❌ Bad

```tsx
<HeaderBar t={title} p={price} u={unit} />
```

### Imports Order in Components

```tsx
// 1. External dependencies
import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// 2. Internal modules (aliases)
import { fetchUser } from 'uiSrc/services/api';
import { userSelector } from 'uiSrc/slices/user/selectors';

// 3. Local imports
import { UserProfileProps } from './UserProfile.types';
import { ERROR_MESSAGES } from './UserProfile.constants';
import { useUserProfile } from './hooks/useUserProfile';

// 4. Styles (always last)
import * as S from './UserProfile.style';
```

### Barrel Files

Avoid short barrel files. Use barrel files (`index.ts`) only when exporting **3 or more** items:

#### ✅ Good (3+ exports)

```tsx
// components/index.ts
export { UserDetails } from './UserDetails/UserDetails';
export { UserAddress } from './UserAddress/UserAddress';
export { UserProfile } from './UserProfile/UserProfile';
```

#### ❌ Bad (less than 3 exports)

```tsx
// components/index.ts
export { UserDetails } from './UserDetails/UserDetails';
export { UserAddress } from './UserAddress/UserAddress';
```

**Important**: Make sure an export happens only in a single barrel file, and is not propagated up the chain of barrel files.

---

## Styled Components

### Encapsulating Styles in .style.ts File

Keep all component styles in a dedicated `.style.ts` file using styled-components. This improves maintainability and consistency.

#### ✅ Good

```tsx
// HeaderBar.style.ts
import styled from 'styled-components/macro';

export const Container = styled.div`
  display: flex;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Title = styled.div`
  color: red;
  font-weight: bold;
  font-size: 24px;
`;

export const Subtitle = styled.span`
  color: gray;
  font-size: 14px;
`;

// HeaderBar.tsx
import * as S from './HeaderBar.style';

return (
  <S.Container>
    <S.Title>{title}</S.Title>
    <S.Subtitle>{subtitle}</S.Subtitle>
  </S.Container>
);
```

#### ❌ Bad

```tsx
// HeaderBar.tsx - inline styles
return <div style={{ color: 'red', fontWeight: 'bold' }}>{title}</div>;
```

### Import Pattern

Use the pattern `import * as S from './Component.style'` to namespace all styled components:

```tsx
import * as S from './Component.style';

return (
  <S.Container>
    <S.Title>Title</S.Title>
    <S.Content>Content</S.Content>
  </S.Container>
);
```

This makes it immediately clear which elements are styled components.

### Conditional Styling

```tsx
// Component.style.ts
import styled from 'styled-components/macro'

export const Button = styled.button<{ $isActive?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $isActive }) => ($isActive ? '#007bff' : '#6c757d')};
  color: white;
  border: none;
  border-radius: 4px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// Component.tsx
<S.Button $isActive={isActive}>Click Me</S.Button>
```

**Note**: Use `$` prefix for transient props that shouldn't be passed to the DOM.

---

## State Management (Redux)

### When to Use What

- **Global State (Redux)**:

  - Data shared across multiple components
  - Data that persists across routes
  - Server state (API data)
  - User preferences/settings

- **Local State (useState)**:

  - UI state (modals, dropdowns, tabs)
  - Form inputs before submission
  - Component-specific temporary data

- **Derived State (Selectors)**:
  - Computed values from Redux state
  - Filtered/sorted lists
  - Aggregated data

### Redux Toolkit Patterns

#### Slice Structure

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  users: User[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, { payload }: PayloadAction<User[]>) => {
      state.users = payload;
    },
    selectUser: (state, { payload }: PayloadAction<string>) => {
      state.selectedId = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUsers, selectUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
```

#### Thunks for Async Actions

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from 'uiSrc/services/api';

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (
    { id, data }: { id: string; data: UserUpdate },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
```

#### Selectors

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'uiSrc/slices/store';

// Basic selectors
export const usersSelector = (state: RootState) => state.user.users;
export const selectedIdSelector = (state: RootState) => state.user.selectedId;
export const loadingSelector = (state: RootState) => state.user.loading;

// Memoized selector (reselect)
export const selectedUserSelector = createSelector(
  [usersSelector, selectedIdSelector],
  (users, selectedId) => users.find((user) => user.id === selectedId),
);

// Complex derived state
export const activeUsersSelector = createSelector([usersSelector], (users) =>
  users.filter((user) => user.status === 'active'),
);
```

#### Redux in Components

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { userActions } from 'uiSrc/slices/user';
import { userSelector } from 'uiSrc/slices/user/selectors';

export const UserProfile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(userSelector);

  const handleUpdate = () => {
    dispatch(userActions.updateUser({ ...user }));
  };

  return <S.Container>{/* ... */}</S.Container>;
};
```

---

## React Best Practices

### Performance Optimization

```typescript
// ✅ GOOD: useCallback for functions passed as props
const handleClick = useCallback(() => {
  dispatch(selectUser(userId))
}, [userId, dispatch])

// ✅ GOOD: useMemo for expensive computations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name))
}, [users])

// ✅ GOOD: React.memo for expensive components
export const UserCard = React.memo<Props>(({ user }) => {
  return <div>{user.name}</div>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.user.id === nextProps.user.id
})

// ❌ BAD: Inline functions in JSX (creates new function on every render)
<button onClick={() => dispatch(selectUser(userId))}>Select</button>

// ✅ GOOD: Extract to useCallback
<button onClick={handleClick}>Select</button>
```

### Effect Cleanup

```typescript
// ✅ GOOD: Proper cleanup
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  const timer = setTimeout(() => {}, 1000);
  const listener = window.addEventListener('resize', handleResize);

  return () => {
    subscription.unsubscribe();
    clearTimeout(timer);
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ❌ BAD: No cleanup
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  // Memory leak! Interval never cleared
}, []);
```

### Keys in Lists

```typescript
// ✅ GOOD: Use unique, stable IDs
users.map(user => (
  <UserCard key={user.id} user={user} />
))

// ❌ BAD: Using array indices
users.map((user, index) => (
  <UserCard key={index} user={user} />
))

// ⚠️ ACCEPTABLE: Only if list never reorders and items have no IDs
staticItems.map((item, index) => (
  <Item key={index} item={item} />
))
```

### Conditional Rendering

```typescript
// ✅ GOOD: Early returns
if (loading) {
  return <Spinner />
}

if (error) {
  return <ErrorMessage error={error} />
}

return <Content data={data} />

// ✅ GOOD: Conditional content
{isEditing && <EditForm />}
{user ? <UserProfile user={user} /> : <EmptyState />}

// ❌ BAD: Nested ternaries (hard to read)
{user ? (
  user.isAdmin ? (
    <AdminPanel />
  ) : (
    <UserPanel />
  )
) : (
  <LoginPrompt />
)}

// ✅ BETTER: Extract to function or use early returns
const renderPanel = () => {
  if (!user) return <LoginPrompt />
  if (user.isAdmin) return <AdminPanel />
  return <UserPanel />
}

return <div>{renderPanel()}</div>
```

---

## Custom Hooks

### Extract Reusable Logic

```typescript
// useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
const SearchComponent: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(searchUsers(debouncedSearchTerm))
    }
  }, [debouncedSearchTerm])

  return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
}
```

### Component-Specific Hooks

Store component-specific hooks in the component's `/hooks` directory:

```tsx
// hooks/useUserDetailsLogic.ts
import { useState, useEffect } from 'react';

export const useUserDetailsLogic = (userId: string) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};

// UserDetails.tsx
import { useUserDetailsLogic } from './hooks/useUserDetailsLogic';

const UserDetails = ({ userId }) => {
  const { user, loading } = useUserDetailsLogic(userId);
  // ... render logic
};
```

---

## Form Handling

### Formik Integration

```typescript
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
})

export const UserForm: FC = () => {
  const handleSubmit = async (values: FormValues) => {
    try {
      await dispatch(updateUser(values))
    } catch (error) {
      console.error('Failed to update user', error)
    }
  }

  return (
    <Formik
      initialValues={{ name: '', email: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form>
          <Field name="name" placeholder="Name" />
          {errors.name && touched.name && <div>{errors.name}</div>}

          <Field name="email" type="email" placeholder="Email" />
          {errors.email && touched.email && <div>{errors.email}</div>}

          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  )
}
```

---

## UI Components

**⚠️ IMPORTANT**: We are **deprecating Elastic UI** components and migrating to **Redis UI** (`@redis-ui/*`) everywhere.

**📦 Component Architecture**: We use **internal wrappers** around Redis UI components. Do not import from `@redis-ui/*` directly. Instead, import from our internal component library which re-exports wrapped components.

### Internal Component Wrappers (Preferred)

```typescript
// ✅ GOOD: Import from internal wrappers
import { Button, Input, FlexGroup, FlexItem } from 'uiSrc/components/ui'

// Our wrappers re-export Redis UI components with project-specific defaults and styling
export const Form: FC = () => {
  return (
    <FlexGroup direction="column" gutterSize="m">
      <FlexItem>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FlexItem>
      <FlexItem>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </FlexItem>
    </FlexGroup>
  )
}
```

```typescript
// ❌ BAD: Don't import directly from @redis-ui
import { Button } from '@redis-ui/components';

// ✅ GOOD: Import from internal wrappers
import { Button } from 'uiSrc/components/ui';
```

### Creating Internal Wrappers

When wrapping a new Redis UI component:

```typescript
// uiSrc/components/ui/Button/Button.tsx
import { Button as RedisButton } from '@redis-ui/components'
import { ButtonProps } from './Button.types'

export const Button: FC<ButtonProps> = (props) => {
  // Add project-specific logic, defaults, or styling here
  return <RedisButton {...props} />
}

// uiSrc/components/ui/index.ts
export { Button } from './Button/Button'
export { Input } from './Input/Input'
// ... other wrapped components
```

### Elastic UI Components (Deprecated)

```typescript
// ❌ DEPRECATED: Don't use Elastic UI for new components
import { EuiButton, EuiFieldText } from '@elastic/eui';

// Only acceptable in existing components not yet migrated
// All new components should use internal wrappers instead
```

**Migration Guidelines**:

- ✅ Use internal wrappers from `uiSrc/components/ui` for all new features
- ✅ Create internal wrappers for Redis UI components as needed
- ✅ Replace Elastic UI components when touching existing code
- ❌ Do not import directly from `@redis-ui/*`
- ❌ Do not add new Elastic UI component imports
- 📝 Check `uiSrc/components/ui` for available wrapped components first

---

## Common Pitfalls

1. ❌ Inline arrow functions in JSX props
2. ❌ Not cleaning up effects
3. ❌ Using array indices as keys
4. ❌ Mutating Redux state directly
5. ❌ Not memoizing expensive computations
6. ❌ Missing dependency arrays in useEffect
7. ❌ Overusing global state
8. ❌ Not handling loading/error states
9. ❌ Large components doing too much
10. ❌ Direct DOM manipulation (use refs sparingly)
11. ❌ Using inline styles instead of styled-components
12. ❌ Not separating types into `.types.ts` files
13. ❌ Creating barrel files with less than 3 exports
14. ❌ Using Elastic UI components in new code (deprecated)
15. ❌ Importing directly from `@redis-ui/*` (use internal wrappers instead)

## Performance Checklist

- [ ] Expensive components wrapped in React.memo
- [ ] Functions passed as props wrapped in useCallback
- [ ] Expensive computations wrapped in useMemo
- [ ] Long lists virtualized (react-window/react-virtualized)
- [ ] Routes lazy loaded
- [ ] Large dependencies code-split
- [ ] Images optimized
- [ ] No unnecessary re-renders

## Key Principles

1. **Separation of Concerns**: Keep styles, types, constants, logic, and presentation separate
2. **Colocate Related Code**: Keep sub-components, hooks, and utilities close to where they're used
3. **Consistent Naming**: Follow naming conventions consistently across all components
4. **Type Safety**: Always define proper TypeScript types, never use `any`
5. **Testability**: Structure components to be easily testable
6. **Readability**: Organize code to be easily understood by new developers
7. **Styled Components**: Prefer styled-components over SCSS modules (migration in progress)
