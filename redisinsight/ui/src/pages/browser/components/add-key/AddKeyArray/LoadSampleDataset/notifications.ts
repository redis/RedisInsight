import { ToastVariant } from 'uiSrc/components/base/display/toast/RiToast'

export const loadSampleDatasetFailedNotification = () => ({
  title: 'Failed to create array',
  message: 'Please try again.',
  variant: 'danger' as ToastVariant,
})

export const sampleDatasetLoadedNotification = (keyName: string) => ({
  title: 'Sample array added',
  message: `The '${keyName}' sample array has been successfully added.`,
  showCloseButton: false,
})

export const sampleDatasetTtlFailedNotification = (keyName: string) => ({
  title: 'Sample array added without TTL',
  message: `The '${keyName}' sample array was created, but the TTL could not be applied.`,
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})

// Copy stays generic on purpose: we can verify only that the key exists, not
// that it holds the bundled sample.
export const keyAlreadyExistsNotification = (keyName: string) => ({
  title: 'Key already exists',
  message: `A key named '${keyName}' already exists in this database.`,
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})
