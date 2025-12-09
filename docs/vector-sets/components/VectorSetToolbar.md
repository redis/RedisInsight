# VectorSetToolbar

Toolbar with search, filter, and element management controls.

## Structure

- Search mode toggle: "Search by text" | "Search by command"
- Search input field
- "Show attributes" button (opens column selector)
- Filter button
- Add element button (+)

## States from Figma

| State | Description |
|-------|-------------|
| Default | Empty search, basic controls |
| Search by text | Text search mode active |
| Search by command | Command search mode active |
| Filter open | Filter panel visible |
| Attributes visible | Column selector panel open |

## Search Modes

### Search by text
Free-text search across element names and attributes.

### Search by command  
Raw Redis command input. Shows preview:
> "Generated Redis command will appear here"

## Show Attributes Button

Toggles the AttributeColumnSelector panel showing checkboxes for:
- Vector (always checked)
- Title
- Author
- Genre
- Language
- Published year
- Rating
- publisher
- Country of origin
- Edition

Each attribute has:
- Label checkbox
- Edit/configure icon

## Props

```typescript
interface VectorSetToolbarProps {
  searchMode: 'text' | 'command'
  searchValue: string
  showAttributes: boolean
  filterActive: boolean
  onSearchModeChange: (mode: 'text' | 'command') => void
  onSearchChange: (value: string) => void
  onToggleAttributes: () => void
  onOpenFilter: () => void
  onAddElement: () => void
}
```

## Figma Reference

- Shows "Search by text" / "Search by command" toggle buttons
- "Show attributes" button on right side
