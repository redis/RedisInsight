# VectorSetElementsTable

Virtualized table displaying Vector Set elements with configurable columns.

## Structure

- Column headers (sortable by Element)
- Virtualized row list (react-virtualized or similar)
- Dynamic attribute columns based on selection
- Score column when filter is active

## Default Columns

| Column | Description |
|--------|-------------|
| Element ↑ | Element name with sort toggle |
| Vector | Truncated vector values with copy icon |

## Attribute Columns (Dynamic)

When attributes are enabled via AttributeColumnSelector:
- Title
- Author
- Genre
- Language
- Published year
- Rating
- publisher
- Country of origin
- Edition

Only visible columns render based on checkbox selection.

## Special Columns

| Column | When Visible | Description |
|--------|--------------|-------------|
| Score | Filter active | Similarity/relevance score |

## Row States

| State | Description |
|-------|-------------|
| Default | Row with data, no hover |
| Hover | Highlighted, action buttons visible |
| Selected | Active selection state |

## Row Actions (on hover)

- View details (magnifier icon)
- Delete element (trash icon)

## Virtualization

Use virtualization for performance with large datasets:
- Only render visible rows
- Smooth scrolling
- Consistent row heights

## Props

```typescript
interface VectorSetElementsTableProps {
  elements: VectorSetElement[]
  columns: ColumnConfig[]
  sortColumn: string
  sortDirection: 'asc' | 'desc'
  filterActive: boolean
  vectorFormat: VectorFormat
  onSort: (column: string) => void
  onElementView: (element: string) => void
  onElementDelete: (element: string) => void
}

interface VectorSetElement {
  name: string
  vector: number[]
  attributes?: Record<string, unknown>
  score?: number
}

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  sortable: boolean
}
```

## Figma Reference

- Mock page: Multiple "Default - list view" frames
- Shows Book 1, Book 2, Book 3 example data
