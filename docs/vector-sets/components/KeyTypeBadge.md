# KeyTypeBadge

Badge component displaying Redis key type with color coding.

## Structure

- Colored background pill/badge
- Key type text label
- Consistent sizing

## Key Types

| Type | Color | Label |
|------|-------|-------|
| STRING | Green | STRING |
| LIST | Blue | LIST |
| SET | Light blue | SET |
| SORTED SET | Orange | SORTED SET |
| HASH | Teal | HASH |
| STREAM | Yellow | STREAM |
| JSON | Purple | JSON |
| GRAPH | Pink | GRAPH |
| TIME SERIES | Cyan | TIME SERIES |
| VECTOR | Red | VECTOR |
| **VECTOR SET** | Teal/Green | VECTOR SET |

## States

| State | Description |
|-------|-------------|
| Default | Normal display |
| Hover | Slightly different shade (if interactive) |

## Sizes

- **sm**: Compact, for list views
- **md**: Standard, for detail headers

## Props

```typescript
interface KeyTypeBadgeProps {
  type: RedisKeyType
  size?: 'sm' | 'md'
}

type RedisKeyType = 
  | 'string' | 'list' | 'set' | 'zset' | 'hash' 
  | 'stream' | 'json' | 'graph' | 'timeseries' 
  | 'vector' | 'vset'
```

## Usage

```tsx
<KeyTypeBadge type="vset" size="md" />
// Renders: [VECTOR SET] badge in teal
```

## Figma Reference

- Mock page: "Vector set in the key type list"
- Shows in VectorSetHeader and key list
