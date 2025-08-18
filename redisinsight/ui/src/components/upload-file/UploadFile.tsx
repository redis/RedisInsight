import React from 'react'

import { RiText } from 'uiBase/text'
import { RiEmptyButton } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import styles from './styles.module.scss'

export interface Props {
  onFileChange: (string: string) => void
  onClick?: () => void
  accept?: string
  id?: string
}

const UploadFile = (props: Props) => {
  const { onFileChange, onClick, accept, id = 'upload-input-file' } = props

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        onFileChange(e?.target?.result as string)
      }
      reader.readAsText(e.target.files[0])
      // reset input value after reading file
      e.target.value = ''
    }
  }

  return (
    <RiEmptyButton className={styles.emptyBtn}>
      <label
        htmlFor={id}
        className={styles.uploadBtn}
        data-testid="upload-file-btn"
      >
        {/* todo: 'folderOpen', replace with redis-ui once available */}
        <RiIcon className={styles.icon} type="KnowledgeBaseIcon" />
        <RiText className={styles.label}>Upload</RiText>
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
          aria-label="Select file"
        />
      </label>
    </RiEmptyButton>
  )
}

export default UploadFile
