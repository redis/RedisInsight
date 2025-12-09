# AttributeDropdown

Dropdown selector for choosing attributes when adding/filtering elements.

## Structure

- Trigger button showing selected value
- Dropdown panel with attribute list
- Autocomplete suggestions based on input

## Discovered Attributes (from Figma)

Example suggestions shown:
- Publication year
- Publication place
- (dynamically discovered from existing elements)

## States

| State | Description |
|-------|-------------|
| Closed | Shows selected value or placeholder |
| Open | Dropdown expanded with options |
| Filtering | Typing with filtered suggestions |
| Empty | No matching attributes |

## Usage Context

Used in:
- AddElementForm (attribute field selection)
- FilterPanel (attribute autocomplete)

## Props

```typescript
interface AttributeDropdownProps {
  value: string
  options: string[]
  placeholder?: string
  onChange: (value: string) => void
  onInputChange?: (input: string) => void
}
```

## Behavior

- Type to filter options
- Click to select
- Enter to confirm
- Escape to close

## Figma Reference

- Part of AddElementForm
- Shows "Publication year", "Publication place" as examples
