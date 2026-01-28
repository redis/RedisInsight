import React from 'react'

import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { GroupBadge, LoadingContent } from 'uiSrc/components'

import * as S from './KeyRowType.styles'

export interface Props {
  nameString: string
  type: KeyTypes | ModulesKeyTypes
}

const KeyRowType = (props: Props) => {
  const { nameString, type } = props

  return (
    <>
      {!type && (
        <S.KeyInfoLoading>
          <LoadingContent
            lines={1}
            data-testid={`type-loading_${nameString}`}
          />
        </S.KeyInfoLoading>
      )}
      {!!type && (
        <S.KeyType>
          <GroupBadge type={type} name={nameString} />
        </S.KeyType>
      )}
    </>
  )
}

export default KeyRowType
