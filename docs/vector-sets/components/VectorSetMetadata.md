# VectorSetMetadata

Stats row displaying Vector Set configuration and metadata.

## Structure

Row layout with key statistics:
- Key size (from VINFO "size")
- Length (element count)
- Vector dim (from VINFO "vector-dim")  
- Quant type (from VINFO "quant-type")
- TTL
- Vector format dropdown
- Add element button (+)

## Displayed Stats

| Stat | Source | Example |
|------|--------|---------|
| Key size | VINFO size | 500 |
| Length | Element count | 3 |
| Vector dim | VINFO vector-dim | 512 |
| Quant type | VINFO quant-type | float32 |
| TTL | Key TTL | No limit |

## Vector Format Dropdown

Options based on quant-type:
- **Vector 32-bit** (default for float32)
- **Binary**
- **HEX**
- **ASCII**
- **Unicode**

## States

| State | Description |
|-------|-------------|
| Default | All stats displayed |
| Loading | Placeholder values |

## Props

```typescript
interface VectorSetMetadataProps {
  keySize: number
  length: number
  vectorDim: number
  quantType: string
  ttl: number | null
  vectorFormat: VectorFormat
  onVectorFormatChange: (format: VectorFormat) => void
  onAddElement: () => void
}

type VectorFormat = 'vector32' | 'binary' | 'hex' | 'ascii' | 'unicode'
```

## Figma Reference

- Shows in header area of VectorSetDetailPanel
- "Vector 32-bit" dropdown visible
