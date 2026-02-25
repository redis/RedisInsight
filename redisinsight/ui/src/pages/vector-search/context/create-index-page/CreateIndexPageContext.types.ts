import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { IndexField } from '../../components/index-details/IndexDetails.types'
import { FieldTypeModalMode } from '../../components/field-type-modal'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import {
  CreateIndexTab,
  CreateIndexMode,
} from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

export interface FieldModalState {
  isOpen: boolean
  mode: FieldTypeModalMode
  field?: IndexField
}

export interface CreateIndexPageContextValue {
  /** Which mode the page is operating in. */
  mode: CreateIndexMode

  /** Currently active tab (table or command). */
  activeTab: CreateIndexTab
  setActiveTab: (tab: CreateIndexTab) => void

  /**
   * Whether the page is in read-only mode.
   * true for SampleData; false for ExistingData.
   */
  isReadonly: boolean

  /** Whether the KeysBrowser panel should be shown (browse mode). */
  showBrowser: boolean

  /** Display title for the page header. */
  displayName: string

  /** Editable index name (ExistingData) or derived name (SampleData). */
  indexName: string
  setIndexName: (name: string) => void

  /** Editable index prefix. */
  indexPrefix: string
  setIndexPrefix: (prefix: string) => void

  /** Key type for existing data (HASH or JSON). */
  keyType: RedisearchIndexKeyType
  setKeyType: (type: RedisearchIndexKeyType) => void

  /** Current index fields. */
  fields: IndexField[]
  setFields: (fields: IndexField[], skippedFields?: string[]) => void

  /** Field names skipped during inference (e.g. complex nested JSON objects). */
  skippedFields: string[]

  /** Row selection state for field include/exclude. */
  rowSelection: RowSelectionState
  onRowSelectionChange: (selection: RowSelectionState) => void

  /** Generated FT.CREATE command. */
  command: string

  /** Validation error for index name (null when valid). */
  indexNameError: string | null

  /** Whether the fields have been modified since the last key load. */
  isFieldsDirty: boolean

  /** Reset the dirty flag (e.g. after confirming key change). */
  resetFieldsDirty: () => void

  /** Whether the "Create index" button should be disabled. */
  isCreateDisabled: boolean

  /** Human-readable reason why "Create index" is disabled (null when enabled). */
  createDisabledReason: string | null

  /** Action state. */
  loading: boolean
  handleCreateIndex: () => void
  handleCancel: () => void

  /** Field modal state and handlers. */
  fieldModal: FieldModalState
  openAddFieldModal: () => void
  openEditFieldModal: (field: IndexField) => void
  closeFieldModal: () => void
  handleFieldSubmit: (field: IndexField) => void
}

export interface CreateIndexPageProviderProps {
  instanceId: string
  mode?: CreateIndexMode
  sampleData?: SampleDataContent
  showBrowser?: boolean
  children: React.ReactNode
}
