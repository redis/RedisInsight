# FilterPanel

Expandable panel for filtering Vector Set elements by attributes.

## Structure

- Filter expression input
- Autocomplete dropdown for attribute names
- Score column (visible when filter active)
- Apply / Clear actions

## States from Figma

| Figma Frame | Description |
|-------------|-------------|
| Open filter | Filter input visible |
| Filter autocomplete | Dropdown with suggestions |
| Active filter (with "score" column) | Filter applied, score visible |
| Hover when filter is active | Row hover with filter |

## Filter Syntax

JavaScript-like expression language:

```
.year > 2020 and .rating >= 4.5
.genre == "Fiction" or .genre == "Science Fiction"
.author in ["Haig", "Herbert"]
not .discontinued
```

### Operators

| Type | Operators |
|------|-----------|
| Arithmetic | `+`, `-`, `*`, `/`, `%`, `**` |
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` |
| Logical | `and`, `or`, `not` (or `&&`, `\|\|`, `!`) |
| Containment | `in` |
| Grouping | `()` |

### Attribute Access

Use dot notation: `.year`, `.rating`, `.author`

## Score Column

When filter is active, a "Score" column appears showing relevance/similarity scores.

## Configuration

- Filter-EF (exploration factor): numeric, default 100

## Props

```typescript
interface FilterPanelProps {
  expression: string
  attributes: string[]
  filterEF: number
  isOpen: boolean
  showScoreColumn: boolean
  onExpressionChange: (expr: string) => void
  onFilterEFChange: (ef: number) => void
  onApply: () => void
  onClear: () => void
  onClose: () => void
}
```

## Figma Reference

- Mock page: "Open filter", "Filter autocomplete", "Active filter" frames
