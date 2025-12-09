# VectorSetHeader

Header component displaying key identification and primary actions.

## Structure

- Key type badge (`VECTOR SET` - teal/green color)
- Key name (full path, truncated if needed)
- "Exit search" button (when in search mode)
- Edit button (pencil icon)
- Delete button (trash icon)
- Expand/Collapse toggle
- Close button (X)

## States

| State | Description |
|-------|-------------|
| Default | All actions visible |
| Searching | "Exit search" button visible |
| Editing | Key name in edit mode |
| Deleting | Confirmation pending |

## Actions

| Action | Icon | Description |
|--------|------|-------------|
| Edit | Pencil | Edit key name |
| Delete | Trash | Delete entire key |
| Expand | Arrows | Toggle fullscreen view |
| Close | X | Close detail panel |
| Exit Search | Text button | Clear search results |

## Key Type Badge

Consistent with other Redis key types:
- Color: Teal/green for VECTOR SET
- Position: Left side of header
- Text: "VECTOR SET"

## Props

```typescript
interface VectorSetHeaderProps {
  keyName: string
  isSearching: boolean
  isExpanded: boolean
  onEdit: () => void
  onDelete: () => void
  onExpand: () => void
  onClose: () => void
  onExitSearch: () => void
}
```

## Figma Reference

- Shows in top of VectorSetDetailPanel
- Badge + name + action icons
