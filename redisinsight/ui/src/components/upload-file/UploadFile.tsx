import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './UploadFile.styles'

export interface Props {
  onFileChange: (string: string) => void
  onClick?: () => void
  accept?: string
  id?: string
}

const UploadFile = (props: Props) => {
  const { onFileChange, onClick, accept, id = 'upload-input-file' } = props

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
    <S.EmptyBtn as={EmptyButton}>
      <S.UploadBtn htmlFor={id} data-testid="upload-file-btn">
        {/* todo: 'folderOpen', replace with redis-ui once available */}
        <S.Icon>
          <RiIcon type="KnowledgeBaseIcon" />
        </S.Icon>
        <S.Label as={Text}>Upload</S.Label>
        <S.FileDrop
          type="file"
          id={id}
          data-testid={id}
          accept={accept || '*'}
          onChange={handleFileChange}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.()
          }}
          aria-label="Select file"
        />
      </S.UploadBtn>
    </S.EmptyBtn>
  )
}

export default UploadFile
