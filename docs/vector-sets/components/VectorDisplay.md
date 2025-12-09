# VectorDisplay

Inline component for displaying truncated vector values.

## Structure

- Comma-separated numeric values
- Truncated with "..." when exceeding display width
- Copy icon on hover/focus

## Display Format

```
0.12, -0.45, 0.89, 0.34, 0.5...
```

## Format Options

Based on Vector Format dropdown selection:
- **Vector 32-bit**: Float values (default for float32)
- **Binary**: Binary representation
- **HEX**: Hexadecimal
- **ASCII**: ASCII characters
- **Unicode**: Unicode characters

## States

| State | Description |
|-------|-------------|
| Truncated | Shows first N values with ellipsis |
| Hover | Copy icon visible |
| Copied | Brief "Copied!" feedback |

## Interaction

- Click copy icon → Copy full vector to clipboard
- Hover → Show copy icon
- Full vector in tooltip (optional)

## Truncation

- Show first 4-5 values based on available width
- Always end with "..." if truncated
- Copy icon at end of row

## Props

```typescript
interface VectorDisplayProps {
  vector: number[]
  format: VectorFormat
  maxVisible?: number // default: 5
  precision?: number  // decimal places, default: 2
  onCopy?: () => void
}

type VectorFormat = 'vector32' | 'binary' | 'hex' | 'ascii' | 'unicode'
```

## Behavior

- Format numbers with consistent precision (2 decimals)
- Respect selected format from dropdown
- Clipboard copy includes full vector array

## Figma Reference

- Shown in Vector column of elements table
- Example: "0.12..." with copy icon
