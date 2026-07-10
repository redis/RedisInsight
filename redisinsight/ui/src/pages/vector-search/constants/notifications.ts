import i18n from 'uiSrc/i18n'
import {
  RiToastType,
  ToastVariant,
} from 'uiSrc/components/base/display/toast/RiToast'

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
    title: i18n.t('notification.success.vectorSearchSampleDataCreated.title'),
    message: i18n.t(
      'notification.success.vectorSearchSampleDataCreated.message',
    ),
    showCloseButton: false,
    actions: {},
  }),

  /**
   * Shown when the index already exists for the chosen sample dataset.
   * Variant: notice – the data is usable but nothing new was created.
   */
  sampleDataAlreadyExists: (): NotificationMessage => ({
    title: i18n.t('notification.success.vectorSearchSampleDataExists.title'),
    message: i18n.t(
      'notification.success.vectorSearchSampleDataExists.message',
    ),
    variant: 'notice' as ToastVariant,
    showCloseButton: false,
    actions: {},
  }),

  /** Shown when the index creation request fails. */
  createFailed: (details?: string): NotificationMessage => ({
    title: i18n.t('notification.error.vectorSearchCreateIndexFailed.title'),
    message:
      details ||
      i18n.t('notification.error.vectorSearchCreateIndexFailed.message'),
    variant: 'danger' as ToastVariant,
  }),

  // TODO: Use when creating an index from existing database keys (not sample data).
  /** Shown after a new index is successfully created from database data. */
  indexCreated: (): NotificationMessage => ({
    title: i18n.t('notification.success.vectorSearchIndexCreated.title'),
    message: i18n.t('notification.success.vectorSearchIndexCreated.message'),
    showCloseButton: false,
    actions: {},
  }),
}

export const queryLibraryNotifications = {
  querySaved: (onGoToLibrary?: VoidFunction): NotificationMessage => ({
    title: i18n.t('notification.success.queryLibrarySaved.title'),
    message: i18n.t('notification.success.queryLibrarySaved.message'),
    showCloseButton: false,
    actions: {
      primary: {
        label: i18n.t('notification.success.queryLibrarySaved.action'),
        onClick: onGoToLibrary ?? (() => {}),
        closes: true,
      },
    },
  }),

  saveFailed: (): NotificationMessage => ({
    title: i18n.t('notification.error.queryLibrarySaveFailed.title'),
    message: i18n.t('notification.error.queryLibrarySaveFailed.message'),
    variant: 'error' as ToastVariant,
  }),

  queryDeleted: (): NotificationMessage => ({
    title: i18n.t('notification.success.queryLibraryDeleted.title'),
    message: '',
  }),

  cleanupFailed: (): NotificationMessage => ({
    title: i18n.t('notification.error.queryLibraryCleanupFailed.title'),
    message: i18n.t('notification.error.queryLibraryCleanupFailed.message'),
    variant: 'error' as ToastVariant,
  }),
}
