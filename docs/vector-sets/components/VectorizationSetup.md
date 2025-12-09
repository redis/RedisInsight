# VectorizationSetup

Configuration panel for generating vector embeddings from text data.

## Overview

When importing data that needs vectorization, users configure how embeddings are generated from text columns.

## Structure

- Column selector dropdown
- Vector format options
- Dimensions configuration
- Preview section (optional)

## Configuration Options

| Option | Description |
|--------|-------------|
| Column to vectorize | Dropdown to select text column |
| Vector format | FP32, 8-bit, Binary |
| Dimensions | Output vector dimensions |

## Vector Format Options

Based on Vector Quantization:
- **Full precision (FP32)**: Standard floating point
- **8-bit quantization (INT8)**: Compressed, faster
- **Binary (1-bit)**: Most compressed

## States

| State | Description |
|-------|-------------|
| Default | Configuration form |
| Validating | Checking column content |
| Preview | Showing sample result |
| Error | Invalid column or config |

## Column Selector

Shows available columns from uploaded file:
- Text columns suitable for vectorization
- Numeric columns (for pre-computed vectors)
- Mixed columns

## Props

```typescript
interface VectorizationSetupProps {
  columns: ColumnInfo[]
  config: VectorizationConfig
  onConfigChange: (config: VectorizationConfig) => void
  onValidate: () => Promise<ValidationResult>
}

interface VectorizationConfig {
  column: string
  format: 'fp32' | 'int8' | 'binary'
  dimensions: number
}

interface ColumnInfo {
  name: string
  type: 'text' | 'numeric' | 'mixed'
  sampleValues: string[]
}
```

## Figma Reference

- Page 2: "Vectorization setup", "Select column to vectorize"
