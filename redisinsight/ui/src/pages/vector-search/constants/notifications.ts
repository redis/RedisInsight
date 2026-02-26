import { ToastVariant } from '@redis-ui/components'
import { RiToastType } from 'uiSrc/components/base/display/toast/RiToast'

interface NotificationMessage {
  title: string
  message: string
  variant?: ToastVariant
  showCloseButton?: boolean
  actions?: RiToastType['actions']
}

/**
 * Toast notifications for the Vector Search index creation flow.
 */
export const createIndexNotifications = {
  /** Shown after a new index is successfully created from sample data. */
  sampleDataCreated: (): NotificationMessage => ({
    title: 'Your sample data is now searchable.',
    message:
      'Start building queries or explore sample ones under Query library.',
    showCloseButton: false,
    actions: {},
  }),

  /**
   * Shown when the index already exists for the chosen sample dataset.
   * Variant: notice – the data is usable but nothing new was created.
   */
  sampleDataAlreadyExists: (): NotificationMessage => ({
    title: 'Your sample data is already searchable using an existing index.',
    message:
      'You can start building new queries or explore existing ones in the Query Library.',
    variant: 'notice' as ToastVariant,
    showCloseButton: false,
    actions: {},
  }),

  /** Shown when the index creation request fails. */
  createFailed: (): NotificationMessage => ({
    title: 'Failed to create index',
    message: 'An error occurred while creating the index. Please try again.',
    variant: 'error' as ToastVariant,
  }),

  // TODO: Use when creating an index from existing database keys (not sample data).
  /** Shown after a new index is successfully created from database data. */
  indexCreated: (): NotificationMessage => ({
    title: 'Index created successfully.',
    message: 'Your data is now searchable. You can start running queries.',
    showCloseButton: false,
    actions: {},
  }),
}

export const queryLibraryNotifications = {
  querySaved: (): NotificationMessage => ({
    title: 'Query saved.',
    message: 'You can find it in the Query Library.',
  }),

  queryDeleted: (): NotificationMessage => ({
    title: 'Query has been deleted.',
    message: '',
  }),

  cleanupFailed: (): NotificationMessage => ({
    title: 'Failed to clean up query library',
    message:
      'An error occurred while removing saved queries for the deleted index.',
    variant: 'error' as ToastVariant,
  }),
}
