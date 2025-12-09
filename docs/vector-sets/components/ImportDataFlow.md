# ImportDataFlow

Multi-step wizard for importing data into Vector Sets with optional vectorization.

## Overview

When creating a new Vector Set, users can choose "Import from file" to upload CSV/JSON data and optionally generate embeddings.

## Flow Steps

### Step 1: Upload File

Upload CSV/JSON file with columns:
- **Elements** (required): Unique identifiers
- **Values** (required): Vector values or text to vectorize
- **Attributes** (optional): Additional metadata

### Step 2: Vectorization Decision

Three options:
- **Already vectorized**: Data contains pre-computed vectors
- **Need to vectorize**: Generate embeddings from text column
- **Partially vectorized**: Mix of both (some rows need generation)

### Step 3: Vectorization Setup (if needed)

Configure embedding generation:
- Select column to vectorize (dropdown)
- Vector format (FP32, 8-bit, Binary)
- Dimensions setting

### Step 4: Import Progress

Show progress:
- File parsing
- Vector generation (if applicable)
- Redis upload
- Completion/error states

## States from Figma (Page 2)

| Frame Name | Description |
|------------|-------------|
| Upload file | Initial file upload |
| Need to vectorize | Vectorization required |
| Already vectorized | Pre-computed vectors |
| Partially vectorized | Mixed state |
| Vectorization setup | Config options |
| Select column to vectorize | Column picker |
| Import progress | Progress bar |
| Error states | Upload/import errors |

## Props

```typescript
interface ImportDataFlowProps {
  keyName: string
  onComplete: (result: ImportResult) => void
  onCancel: () => void
}

interface ImportResult {
  elementsImported: number
  vectorsGenerated: number
  attributesImported: number
}
```

## Figma Reference

- Page 2: Import/vectorization flow
- Multi-frame wizard design
