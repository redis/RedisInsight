# CreateVectorSetForm

Form for creating a new Vector Set key.

## Entry Points from Figma

| Figma Frame | Description |
|-------------|-------------|
| Add new key - default | Initial key type selection |
| Key type Vector set | Vector Set selected |
| Vector set in the key type list | Type dropdown |

Three creation options:
1. **Add manually** (this form)
2. **Import sample data**
3. **Import from file** (see ImportDataFlow.md)

## Form Fields

### Required

| Field | Description |
|-------|-------------|
| Key name | Unique key identifier |
| TTL | Time to live (or "No limit") |
| Element | First element name |
| Vector | FP32 or string array |

### Optional

| Field | Default | Description |
|-------|---------|-------------|
| Dimension Reduction | - | Numeric field |
| CAS | Disabled | Threaded Neighbor Collection |
| Vector Quantization | Full precision | 8-bit, Binary options |
| Build Exploration Factor | 200 | Numeric field |
| Attributes | - | JSON format |
| Max connections per node | 16 | Numeric field |

## Vector Quantization Options

- **Full precision**: FP32 (default)
- **8-bit quantization**: INT8
- **Binary**: 1-bit per dimension

## States

| State | Description |
|-------|-------------|
| Initial | Empty form |
| Filling | Partial data entered |
| Validating | Checking inputs |
| Creating | Submitting to Redis |
| Error | Validation/creation error |

## Props

```typescript
interface CreateVectorSetFormProps {
  onSubmit: (data: CreateVectorSetPayload) => Promise<void>
  onCancel: () => void
}

interface CreateVectorSetPayload {
  keyName: string
  ttl: number | null
  element: string
  vector: number[]
  dimensionReduction?: number
  cas?: boolean
  quantization: 'full' | '8bit' | 'binary'
  buildEF?: number
  attributes?: Record<string, unknown>
  maxConnections?: number
}
```

## Figma Reference

- Mock page: "Add new key - default", "Key type Vector set"
- Shows in modal or side panel
