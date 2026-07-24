import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

export interface Props {
  onFileChange: (string: string) => void
  onClick?: () => void
  accept?: string
  id?: string
}

const UploadFile = (props: Props) => {
  const { onFileChange, onClick, accept, id = 'upload-input-file' } = props
  const { t } = useTranslation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileBlob = e.target.files[0]
      fileBlob.text().then((text) => {
        onFileChange(text)
      })
      e.target.value = ''
    }
  }

  return (
    <EmptyButton className={styles.emptyBtn}>
      <label
        htmlFor={id}
        className={styles.uploadBtn}
        data-testid="upload-file-btn"
      >
        {/* todo: 'folderOpen', replace with redis-ui once available */}
        <RiIcon className={styles.icon} type="KnowledgeBaseIcon" />
        <Text className={styles.label}>{t('browser.addKey.upload.label')}</Text>
        <input
          type="file"
          id={id}
          data-testid={id}
          accept={accept || '*'}
          onChange={handleFileChange}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.()
          }}
          className={styles.fileDrop}
          aria-label={t('browser.addKey.upload.aria')}
        />
      </label>
    </EmptyButton>
  )
}

export default UploadFile
