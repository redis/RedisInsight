# Frontend Development (React/Redux)

## Component Structure

### Functional Components

- Use **functional components with hooks** (no class components)
- **Prefer named exports** over default exports
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks

### Component Folder Structure

Each component in its own directory under `**/ComponentName`:

```
ComponentName/
  ComponentName.tsx          # Main component
  ComponentName.style.ts     # Styled-components styles
  ComponentName.types.ts     # TypeScript interfaces
  ComponentName.spec.tsx     # Tests
  ComponentName.constants.ts # Constants
  ComponentName.story.tsx    # Storybook examples
  hooks/                     # Custom hooks
  components/                # Sub-components
  utils/                     # Utility functions
```

### Props Interface

- Name as `ComponentNameProps`
- Use separate interfaces for complex prop objects
- Always use proper TypeScript types, never `any`

### Imports Order in Components

1. External dependencies (`react`, `redux`, etc.)
2. Internal modules (aliases)
3. Local imports (types, constants, hooks)
4. Styles (always last: `import * as S from './Component.style'`)

### Barrel Files

Use barrel files (`index.ts`) only when exporting **3 or more** items. Make sure exports appear in only one barrel file, not propagated up the chain.

## Styled Components

**We are migrating to styled-components** (deprecating SCSS modules).

### Encapsulate Styles in .style.ts

Keep all component styles in dedicated `.style.ts` files using styled-components.

### Import Pattern

```typescript
import * as S from './Component.style'

return (
  <S.Container>
    <S.Title>Title</S.Title>
    <S.Content>Content</S.Content>
  </S.Container>
)
```

### Conditional Styling

Use `$` prefix for transient props that shouldn't pass to DOM:

```typescript
export const Button = styled.button<{ $isActive?: boolean }>`
  background-color: ${({ $isActive }) => ($isActive ? '#007bff' : '#6c757d')};
`;
```

## State Management (Redux)

### When to Use What

- **Global State (Redux)**:

  - Data shared across multiple components
  - Data persisting across routes
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

- Use `createSlice` from Redux Toolkit
- Define proper TypeScript types for state
- Use `PayloadAction<T>` for action typing
- Handle async with `extraReducers` and thunks

#### Thunks

- Use `createAsyncThunk` for async operations
- Handle pending, fulfilled, and rejected states
- Use `rejectWithValue` for error handling

#### Selectors

- Create basic selectors for direct state access
- Use `createSelector` from `reselect` for memoized/computed values
- Keep selectors in separate `selectors.ts` file

## React Best Practices

### Performance

- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Use `React.memo` for expensive components
- Avoid inline arrow functions in JSX props

### Effect Cleanup

Always clean up subscriptions, timers, and event listeners in `useEffect` return function.

### Keys in Lists

- Use unique, stable IDs (not array indices)
- Only use indices if list never reorders and items have no IDs

### Conditional Rendering

- Use early returns for loading/error states
- Avoid deeply nested ternaries - extract to functions

## Custom Hooks

### Extract Reusable Logic

Create custom hooks for reusable stateful logic. Store component-specific hooks in the component's `/hooks` directory.

## Form Handling

Use Formik with Yup for validation. Keep form logic in custom hooks when complex.

## UI Components

**⚠️ IMPORTANT**:

- We are **deprecating Elastic UI** components
- Migrating to **Redis UI** (`@redis-ui/*`)
- **Use internal wrappers** from `uiSrc/components/ui`
- **DO NOT import directly** from `@redis-ui/*`

### Component Usage

```typescript
// ✅ GOOD: Import from internal wrappers
import { Button, Input, FlexGroup } from 'uiSrc/components/ui';

// ❌ BAD: Don't import directly from @redis-ui
import { Button } from '@redis-ui/components';

// ❌ DEPRECATED: Don't use Elastic UI for new code
import { EuiButton } from '@elastic/eui';
```

### Migration Guidelines

- ✅ Use internal wrappers from `uiSrc/components/ui` for all new features
- ✅ Create internal wrappers for Redis UI components as needed
- ✅ Replace Elastic UI when touching existing code
- ❌ Do not import directly from `@redis-ui/*`
- ❌ Do not add new Elastic UI imports

## Testing Components

### Always Use Shared `renderComponent` Helper

**CRITICAL**: Create a `renderComponent` helper function for each component test file:

```typescript
describe('MyComponent', () => {
  const defaultProps: MyComponentProps = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    onComplete: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<MyComponentProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <Provider store={store}>
        <MyComponent {...props} />
      </Provider>
    )
  }

  it('should render', () => {
    renderComponent()
    // assertions
  })
})
```

Benefits:

- Centralized setup and providers
- Default props in one place
- Easy prop overrides per test
- No duplicate render logic

### Testing Redux

Create a test store with `configureStore` for components connected to Redux.

## Key Principles

1. **Separation of Concerns**: Keep styles, types, constants, logic separate
2. **Colocate Related Code**: Keep sub-components and hooks close to usage
3. **Consistent Naming**: Follow conventions across all components
4. **Type Safety**: Always define proper types, never `any`
5. **Testability**: Structure for easy testing with `renderComponent` helper
6. **Styled Components**: Prefer styled-components over SCSS modules
