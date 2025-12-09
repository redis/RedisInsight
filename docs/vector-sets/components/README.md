# Vector Sets Components

Component breakdown for the Vector Sets feature in RedisInsight.

## Component Hierarchy

```
VectorSetDetailPanel (main container)
├── VectorSetHeader
│   ├── KeyTypeBadge (VECTOR SET)
│   ├── Key name
│   ├── Exit search button
│   └── Actions (edit, delete, expand, close)
├── VectorSetMetadata
│   ├── Stats (size, length, dim, quant, ttl)
│   └── VectorFormatDropdown
├── VectorSetToolbar
│   ├── SearchModeToggle (element/vector)
│   ├── ElementSearchInput (search by element name)
│   ├── VectorSearchInput (search by vector)
│   ├── FilterButton → FilterPanel (with auto-suggest on `.`)
│   ├── ShowAttributesButton → AttributeColumnSelector
│   └── AddButton → AddElementForm
├── AddElementForm (expandable)
│   ├── ElementNameInput
│   ├── VectorInput (with "Generate Sample" button)
│   ├── Raw/JSON toggle
│   └── Attributes section (collapsible, Monaco editor)
├── AttributeColumnSelector (side panel)
│   └── Checkbox list (Vector, Title, Author, etc.)
└── VectorSetElementsTable (virtualized)
    └── VectorSetElementRow
        ├── Element name
        ├── VectorDisplay
        ├── AttributeCells (dynamic)
        ├── Score (when filter active)
        └── RowActions (hover: view, delete)

CreateVectorSetForm (modal/side panel)
├── Key name, TTL inputs
├── Element, Vector inputs
├── Quantization options
└── Advanced options

ImportDataFlow (wizard)
├── Upload file
├── Vectorization decision
├── Vectorization setup
└── Progress/completion
```

## Component Files

| Component                                                   | Description                                 | Iteration |
| ----------------------------------------------------------- | ------------------------------------------- | --------- |
| [VectorSetDetailPanel](./VectorSetDetailPanel.md)           | Main container for vector set view          | 1         |
| [VectorSetHeader](./VectorSetHeader.md)                     | Key badge, name, and actions                | 1         |
| [VectorSetMetadata](./VectorSetMetadata.md)                 | Stats row (size, dim, quant, TTL)           | 1         |
| [VectorSetToolbar](./VectorSetToolbar.md)                   | Search, filter, attribute controls          | 1         |
| [VectorSetElementsTable](./VectorSetElementsTable.md)       | Virtualized elements table                  | 1         |
| [VectorSetElementRow](./VectorSetElementRow.md)             | Single element row with actions             | 1         |
| [AddElementForm](./AddElementForm.md)                       | Form to add new elements (with sample gen)  | 1         |
| [AttributeColumnSelector](./AttributeColumnSelector.md)     | Column visibility panel                     | 1         |
| [FilterPanel](./FilterPanel.md)                             | Filter expression with auto-suggest on `.`  | 1         |
| [VectorDisplay](./VectorDisplay.md)                         | Truncated vector display with copy/download | 1         |
| [KeyTypeBadge](./KeyTypeBadge.md)                           | Key type indicator badge                    | 1         |
| [ElementSearchInput](./ElementSearchInput.md)               | Search by element name                      | 1         |
| [VectorSearchInput](./VectorSearchInput.md)                 | Search by vector similarity                 | 1         |
| [SampleDataGenerator](./SampleDataGenerator.md)             | Generate word2vec sample vectors            | 1         |
| [DeleteElementConfirmation](./DeleteElementConfirmation.md) | Delete confirmation dialog                  | 1         |
| [CreateVectorSetForm](./CreateVectorSetForm.md)             | New vector set creation                     | 1         |
| [ImportDataFlow](./ImportDataFlow.md)                       | Import data wizard (CSV)                    | 2         |
| [VectorizationSetup](./VectorizationSetup.md)               | Embedding generation config (TBD)           | 2         |

## All States from Figma

### Mock Page (Main Views)

| Frame Name                               | Description                           |
| ---------------------------------------- | ------------------------------------- |
| Default - list view                      | Base table view (multiple variations) |
| Key with new elements                    | After adding elements                 |
| View attributes                          | Attributes panel visible              |
| View attributes - edit mode              | Editing attribute config              |
| Add element                              | Basic add form                        |
| Add element - open attributes            | Form with attrs expanded              |
| Add element - closed attributes          | Form with attrs collapsed             |
| Add element - with attributes            | Form with attrs filled                |
| Add element - add attributes             | Adding new attribute                  |
| Add element - multiple elements - scroll | Scrollable elements                   |
| Additional element                       | Adding more elements                  |
| Open filter                              | Filter input visible                  |
| Filter autocomplete                      | Filter with suggestions               |
| Active filter (with "score" column)      | Filter applied                        |
| Hover                                    | Row hover state                       |
| Hover when filter is active              | Hover with filter on                  |
| Delete key                               | Delete confirmation                   |
| Edit vector                              | Editing vector values                 |
| Vector set in the key type list          | Type dropdown                         |
| Add new key - default                    | Initial type selection                |
| Key type Vector set                      | Vector Set selected                   |

### Page 2 (Import Flow)

| Frame Name                 | Description                       |
| -------------------------- | --------------------------------- |
| Upload file                | Elements/Values/Attributes upload |
| Need to vectorize          | Vectorization required            |
| Already vectorized         | Pre-computed vectors              |
| Partially vectorized       | Mixed state                       |
| Vectorization setup        | Format, dimensions                |
| Select column to vectorize | Column picker                     |
| Import progress            | Progress indicator                |
| Error states               | Upload/import errors              |

### Page 3 (Variations)

| Frame Name                      | Description         |
| ------------------------------- | ------------------- |
| Additional list view variations | Alternative layouts |
| New key vs Existing states      | Creation vs viewing |

## Screenshots

Available in `./screenshots/`:

- `vector-set-overview.png` - Main view with attributes panel
- `default-list-view.png` - Basic table view

## Figma Source

- File: RI-Vector-Sets
- Mock page: Primary component states
- Page 2: Import/vectorization flow
- Page 3: Additional variations
