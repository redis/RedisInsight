import { IndexField } from '../../components/index-details/IndexDetails.types'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { CreateIndexTab } from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

export interface CreateIndexPageContextValue {
  /** Currently active tab (table or command). */
  activeTab: CreateIndexTab
  setActiveTab: (tab: CreateIndexTab) => void

  /**
   * Whether the page is in read-only mode.
   * Controls disabled state for "+ Add field", index prefix editing,
   * and IndexDetails mode in a single place.
   */
  isReadonly: boolean

  /** Derived data from the selected sample dataset. */
  displayName: string
  indexPrefix: string
  fields: IndexField[]
  command: string

  /** Action state. */
  loading: boolean
  handleCreateIndex: () => void
  handleCancel: () => void
}

export interface CreateIndexPageProviderProps {
  instanceId: string
  sampleData: SampleDataContent
  children: React.ReactNode
}
