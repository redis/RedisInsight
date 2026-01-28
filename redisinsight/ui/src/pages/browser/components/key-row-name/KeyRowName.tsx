import React from 'react'
import { isUndefined } from 'lodash'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { Maybe, formatLongName, replaceSpaces } from 'uiSrc/utils'

import * as S from './KeyRowName.styles'

export interface Props {
  nameString: Maybe<string>
  shortName: Maybe<string>
}

const KeyRowName = (props: Props) => {
  const { nameString, shortName } = props

  if (isUndefined(shortName)) {
    return (
      <S.KeyInfoLoading>
        <LoadingContent lines={1} data-testid="name-loading" />
      </S.KeyInfoLoading>
    )
  }

  // Better to cut the long string, because it could affect virtual scroll performance
  const nameContent = replaceSpaces(shortName?.substring?.(0, 200))
  const nameTooltipContent = formatLongName(nameString)

  return (
    <S.KeyName>
      <Text
        component="div"
        color="secondary"
        style={{ maxWidth: '100%', display: 'flex', paddingRight: 16 }}
      >
        <div
          style={{ display: 'flex' }}
          className="truncateText"
          data-testid={`key-${shortName}`}
        >
          <RiTooltip
            title="Key Name"
            position="bottom"
            content={nameTooltipContent}
          >
            <>{nameContent}</>
          </RiTooltip>
        </div>
      </Text>
    </S.KeyName>
  )
}

export default KeyRowName
