# AttributeColumnSelector

Side panel for selecting which attribute columns to display in the table.

![Attribute Selector](./screenshots/vector-set-overview.png)

## Structure

- Side panel (opens from right of table)
- Header: "Attributes" or similar
- List of attribute rows with checkboxes
- Each row: Label + Checkbox + Edit icon

## Discovered Attributes (from Figma)

| Attribute | Checked | Has Edit |
|-----------|---------|----------|
| Vector | ✓ (always) | No |
| Title | Configurable | Yes |
| Author | Configurable | Yes |
| Genre | Configurable | Yes |
| Language | Configurable | Yes |
| Published year | Configurable | Yes |
| Rating | Configurable | Yes |
| publisher | Configurable | Yes |
| Country of origin | Configurable | Yes |
| Edition | Configurable | Yes |

## States from Figma

| Figma Frame | Description |
|-------------|-------------|
| View attributes | Panel visible |
| View attributes - edit mode | Editing attribute config |

## Attribute Row

Each attribute shows:
- Label text
- Checkbox (checked = column visible in table)
- Edit icon (configure/rename)

## Props

```typescript
interface AttributeColumnSelectorProps {
  attributes: AttributeConfig[]
  onToggle: (attributeName: string) => void
  onEdit: (attributeName: string) => void
  isOpen: boolean
  onClose: () => void
}

interface AttributeConfig {
  name: string
  visible: boolean
  editable: boolean
}
```

## Behavior

- Toggle checkbox → Show/hide column in table
- Click edit icon → Open attribute configuration
- Attributes discovered from VGETATTR on elements

## Figma Reference

- Mock page: "View attributes", "View attributes - edit mode"
- Shows panel with checkbox list on right side
