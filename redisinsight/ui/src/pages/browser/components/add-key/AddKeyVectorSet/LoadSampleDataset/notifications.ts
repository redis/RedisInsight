import { ToastVariant } from 'uiSrc/components/base/display/toast/RiToast'

import { VEC2WORD_COLLECTION_NAME } from './data'

/** Toast shown when the bulk-import POST for `vec2word` fails. */
export const loadSampleDatasetFailedNotification = () => ({
  title: 'Failed to create vector set',
  message: 'Please try again.',
  variant: 'danger' as ToastVariant,
})

/** Green success toast shown after the bulk-import POST for `vec2word` succeeds. */
export const sampleDatasetLoadedNotification = () => ({
  title: 'Sample vector set added',
  message: `The '${VEC2WORD_COLLECTION_NAME}' sample vector set has been successfully added.`,
  showCloseButton: false,
})

/**
 * Toast shown when the user clicks "Add key" in sample-dataset mode but the
 * target key already exists. We can only verify the key is present — not
 * that it actually holds the bundled sample dataset — so the copy intentionally
 * stays generic.
 */
export const keyAlreadyExistsNotification = () => ({
  title: 'Key already exists',
  message: `A key named '${VEC2WORD_COLLECTION_NAME}' already exists in this database.`,
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})
