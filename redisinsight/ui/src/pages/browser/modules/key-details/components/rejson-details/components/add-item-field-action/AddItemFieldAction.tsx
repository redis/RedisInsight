import React from 'react'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { getBrackets } from '../../utils'
import * as S from '../../Rejson.styles'

export interface Props {
  leftPadding: number
  type: string
  onClickSetKVPair: () => void
}

const AddItemFieldAction = ({ leftPadding, type, onClickSetKVPair }: Props) => (
  <S.Row style={{ paddingLeft: `${leftPadding}em` }}>
    <S.DefaultFont>{getBrackets(type, 'end')}</S.DefaultFont>
    <IconButton
      icon={PlusIcon}
      size="S"
      className={S.actionButtonsClassName}
      onClick={onClickSetKVPair}
      aria-label="Add field"
      data-testid="add-field-btn"
    />
  </S.Row>
)

export default AddItemFieldAction
