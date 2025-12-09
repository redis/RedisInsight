# VectorSetElementRow

Single row in the Vector Set elements table.

## Structure

- Element name cell (with sort toggle)
- Vector cell (truncated values with copy icon)
- Attribute cells (dynamic, based on selection)
- Score cell (when filter active)
- Action buttons (visible on hover)

## Columns

| Column | Always Visible | Content |
|--------|----------------|---------|
| Element ↑ | Yes | Element name with sort indicator |
| Vector | Yes | Truncated values (e.g., "0.12... 📋") |
| Title | Configurable | Book title |
| Author | Configurable | Author name |
| Genre | Configurable | Genre category |
| Language | Configurable | Language |
| Score | When filtering | Similarity score |
| Actions | On hover | View, Delete icons |

## States from Figma

| Figma Frame | Description |
|-------------|-------------|
| Hover | Row highlighted, actions visible |
| Hover when filter is active | Hover with score column visible |
| Default | No hover, basic display |

## Row Actions

| Action | Icon | Description |
|--------|------|-------------|
| View | Magnifier | View element details/attributes |
| Delete | Trash | Delete element (VREM) |

## Example Data (from Figma)

| Element | Vector | Title | Author | Genre |
|---------|--------|-------|--------|-------|
| Book 1 | 0.12... | The Midnight Library | Matt Haig | Fiction |
| Book 2 | 0.12... | Dune | Frank Herbert | Science Fiction |
| Book 3 | 0.12... | Charlotte's Web | E. B. White | Children |

## Props

```typescript
interface VectorSetElementRowProps {
  element: string
  vector: number[]
  attributes?: Record<string, unknown>
  visibleColumns: string[]
  vectorFormat: VectorFormat
  isSelected: boolean
  filterActive: boolean
  score?: number
  onSelect: () => void
  onView: () => void
  onDelete: () => void
}
```

## Figma Reference

- Mock page: "Hover", "Hover when filter is active" frames
- Table showing Book 1, Book 2, Book 3 with attributes
