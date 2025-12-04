---
alwaysApply: true
---

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
  ComponentName.styles.ts    # Styled-components styles (PascalCase)
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
4. Styles (always last: `import { Container } from './Component.styles'`)

### Barrel Files

Use barrel files (`index.ts`) only when exporting **3 or more** items. Make sure exports appear in only one barrel file, not propagated up the chain.

## Styled Components

**We are migrating to styled-components** (deprecating SCSS modules).

### Encapsulate Styles in .styles.ts

Keep all component styles in dedicated `.styles.ts` files using styled-components. Use PascalCase for the filename to match the component name:

```
ComponentName/
  ComponentName.tsx
  ComponentName.styles.ts  # ✅ PascalCase
  # Not component-name.styles.ts ❌
```

### Import Pattern

Keep all component styles in dedicated .style.ts files and import them with a namespace.

**CRITICAL: `import * as S` is reserved for local styles only** (e.g., from `ComponentName.styles.ts`). When you need to use styled components from external components, create a local styles file that re-exports them.

#### ✅ Good

```typescript
// ComponentName.tsx
import * as S from './ComponentName.styles'

return (
  <S.Container>
    <S.Title>Title</S.Title>
    <S.Content>Content</S.Content>
  </S.Container>
)

// ComponentName.styles.ts (when re-exporting from external component)
export { ExternalStyledComponent } from '../ExternalComponent/ExternalComponent.styles'
```

#### ❌ Bad

```typescript
// ❌ BAD: Importing styled components directly from external component
import * as S from '../ExternalComponent/ExternalComponent.styles'

// ❌ BAD: Named imports instead of namespace
import { Container, Title, Content } from './Component.styles'
```

### Use Layout Components Instead of div

**Prefer `FlexGroup` over `div`** when creating flex containers:

```typescript
// ✅ GOOD: Use FlexGroup
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled(FlexGroup)`
  user-select: none;
`

// Usage: Pass layout props as component props
<Wrapper align="center" justify="end">
  {children}
</Wrapper>

// ❌ BAD: Using div with hardcoded flex properties
export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`
```

### Pass Layout Props as Component Props

**Don't hardcode layout properties** in styled components when using layout components like `FlexGroup`. Pass them as props instead:

```typescript
// ✅ GOOD: Pass props in JSX
export const Wrapper = styled(FlexGroup)`
  user-select: none;
`

<Wrapper align="center" justify="end">
  {children}
</Wrapper>

// ❌ BAD: Hardcoding in styled component
export const Wrapper = styled(FlexGroup)`
  align-items: center;
  justify-content: flex-end;
  user-select: none;
`
```

### Use Gap Prop Instead of Custom Margins

**Prefer `gap` prop on layout components** instead of custom margins for spacing between elements:

```typescript
// ✅ GOOD: Use gap prop
<Row align="center" justify="between" gap="l">
  <FlexItem>Item 1</FlexItem>
  <FlexItem>Item 2</FlexItem>
</Row>
```

### Use Theme Spacing Instead of Magic Numbers

**Always use theme spacing values** instead of hardcoded pixel values:

```typescript
// ✅ GOOD: Use theme spacing
export const Container = styled(Row)`
  height: ${({ theme }) => theme.core.space.space500};
  padding: 0 ${({ theme }) => theme.core.space.space200};
  margin-bottom: ${({ theme }) => theme.core.space.space200};
`;

// ❌ BAD: Using magic numbers
export const Container = styled(Row)`
  height: 64px;
  padding: 0 16px;
  margin-bottom: 16px;
`;
```

### Use Semantic Colors from Theme

**Always use semantic colors** from the theme instead of CSS variables or hardcoded colors:

```typescript
// ✅ GOOD: Use semantic colors
export const Header = styled(Row)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`;

// ❌ BAD: Using deprecated EUI CSS variables
export const Header = styled(Row)`
  background-color: var(--euiColorEmptyShade);
  border-bottom: 1px solid var(--separatorColor);
`;
```

### Use Layout Components (Row/Col/FlexGroup) Instead of div

**Prefer layout components** from the layout system instead of regular `div` elements:

```typescript
// ✅ GOOD: Use Row component
import { Row } from 'uiSrc/components/base/layout/flex'

export const PageHeader = styled(Row)`
  height: ${({ theme }) => theme.core.space.space500};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

<PageHeader align="center" justify="between" gap="l">
  {children}
</PageHeader>

// ❌ BAD: Using div with flex properties
export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`
```

### Conditional Styling

Use `$` prefix for transient props that shouldn't pass to DOM:

```typescript
export const Button = styled.button<{ $isActive?: boolean }>`
  background-color: ${({ $isActive }) => ($isActive ? '#007bff' : '#6c757d')};
`;
```

### Avoid !important

**Never use `!important` in styled-components**. Styled-components handles CSS specificity through component hierarchy. If you need to override styles, use more specific selectors or adjust the component structure:

```typescript
// ✅ GOOD: Rely on CSS specificity
export const IconButton = styled(IconButton)<{ isOpen: boolean }>`
  ${({ isOpen }) =>
    isOpen &&
    css`
      background-color: ${({ theme }) =>
        theme.semantic.color.background.primary200};
    `}
`;

// ❌ BAD: Using !important
export const IconButton = styled(IconButton)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.primary200} !important;
`;
```

### Verify Type System Compatibility

When using layout components or other typed components, verify your prop values match the type system:

```typescript
// Check the component's type definitions
// FlexGroup accepts: align?: 'center' | 'stretch' | 'baseline' | 'start' | 'end'
// Use valid values from the type system
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
7. **Layout Components**: Use FlexGroup instead of div for flex containers, pass layout props as component props
8. **Type Safety**: Verify prop values match component type definitions (e.g., FlexGroup's align/justify values)
