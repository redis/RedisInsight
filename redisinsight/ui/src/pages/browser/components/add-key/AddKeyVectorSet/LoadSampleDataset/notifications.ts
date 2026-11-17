import { ToastVariant } from 'uiSrc/components/base/display/toast/RiToast'
import i18n from 'uiSrc/i18n'

import { VEC2WORD_COLLECTION_NAME } from './data'

/** Toast shown when the bulk-import POST for `vec2word` fails. */
export const loadSampleDatasetFailedNotification = () => ({
  title: i18n.t('notification.error.createVectorSet.title'),
  message: i18n.t('notification.error.createVectorSet.message'),
  variant: 'danger' as ToastVariant,
})

/** Green success toast shown after the bulk-import POST for `vec2word` succeeds. */
export const sampleDatasetLoadedNotification = () => ({
  title: i18n.t('notification.success.sampleVectorSetAdded.title'),
  message: i18n.t('notification.success.sampleVectorSetAdded.message', {
    keyName: VEC2WORD_COLLECTION_NAME,
  }),
  showCloseButton: false,
})

/**
 * Toast shown when the user clicks "Add key" in sample-dataset mode but the
 * target key already exists. We can only verify the key is present — not
 * that it actually holds the bundled sample dataset — so the copy intentionally
 * stays generic.
 */
export const keyAlreadyExistsNotification = () => ({
  title: i18n.t('notification.warning.keyExists.title'),
  message: i18n.t('notification.warning.keyExists.message', {
    keyName: VEC2WORD_COLLECTION_NAME,
  }),
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})
