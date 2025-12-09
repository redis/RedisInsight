# AddElementForm

Expandable form for adding new elements to a Vector Set.

## Structure

- Attribute dropdown (select attribute field)
- Value input field  
- Raw/JSON toggle button
- Attributes section (collapsible)
- Cancel / Add buttons

## States from Figma

| Figma Frame | Description |
|-------------|-------------|
| Add element | Basic form |
| Add element - open attributes | Attributes section expanded |
| Add element - closed attributes | Attributes section collapsed |
| Add element - with attributes | Form with attributes filled |
| Add element - add attributes | Adding new attribute |
| Add element - multiple elements - scroll | Multiple elements, scrollable |
| Additional element | Adding more elements |

## Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Attribute | No | Dropdown to select attribute field |
| Value | Yes | Text input for value |
| Vector | Yes | FP32 values or string array |
| Attributes | No | JSON key-value pairs (collapsible) |

## Attribute Dropdown

Shows autocomplete suggestions for attribute names:
- Publication year
- Publication place
- (dynamic based on existing attributes)

## Toggle Modes

- **Raw**: Plain text input
- **JSON**: JSON formatted input

## Props

```typescript
interface AddElementFormProps {
  onAdd: (element: AddElementPayload) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  attributeSuggestions: string[]
}

interface AddElementPayload {
  element: string
  vector: number[] | string[]
  attributes?: Record<string, unknown>
}
```

## Figma Reference

- Mock page: "Add element" related frames
- Shows dropdown with "Publication year", "Publication place" suggestions
