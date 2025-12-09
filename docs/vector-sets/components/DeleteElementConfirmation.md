# DeleteElementConfirmation

Confirmation dialog for deleting an element from a Vector Set.

## Structure

- Warning icon
- Confirmation message
- Element name highlighted
- Key name reference
- Cancel / Remove buttons

## Message Format

```
"{elementName}" will be removed from "{keyName}"
```

## States from Figma

| Figma Frame | Description |
|-------------|-------------|
| Delete key | Delete confirmation dialog |

## Dialog Content

- Warning/alert icon (red/orange)
- Confirmation text with element name
- Key name context
- Two action buttons

## Actions

- **Cancel**: Close dialog, no action
- **Remove**: Execute VREM command

## Props

```typescript
interface DeleteElementConfirmationProps {
  elementName: string
  keyName: string
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}
```

## Behavior

- Modal overlay
- Focus trap for accessibility
- Escape key closes dialog
- Loading state during deletion

## Figma Reference

- Mock page: "Delete key" frame
- Triggered by delete icon on element row hover
