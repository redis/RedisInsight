import React from 'react'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { useCreateIndexPage } from '../../../context/create-index-page'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexFooter = () => {
  const { loading, handleCreateIndex, handleCancel } = useCreateIndexPage()

  return (
    <S.FooterRow
      align="center"
      justify="end"
      gap="s"
      data-testid="vector-search--create-index--footer"
    >
      <SecondaryButton
        onClick={handleCancel}
        data-testid="vector-search--create-index--cancel-btn"
      >
        Cancel
      </SecondaryButton>
      <PrimaryButton
        loading={loading}
        onClick={handleCreateIndex}
        data-testid="vector-search--create-index--submit-btn"
      >
        Create index
      </PrimaryButton>
    </S.FooterRow>
  )
}
