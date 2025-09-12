import React from 'react'
import { isUndefined } from 'lodash'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { Maybe, formatLongName, replaceSpaces } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  nameString: Maybe<string>
  shortName: Maybe<string>
}

const KeyRowName = (props: Props) => {
  const { nameString, shortName } = props

  if (isUndefined(shortName)) {
    return (
      <LoadingContent
        lines={1}
        className={styles.keyInfoLoading}
        data-testid="name-loading"
      />
    )
  }

  // Better to cut the long string, because it could affect virtual scroll performance
  const nameContent = replaceSpaces(shortName?.substring?.(0, 200))
  const nameTooltipContent = formatLongName(nameString)

  return (
    <div className={styles.keyName}>
      <Text
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
            className={styles.tooltip}
            anchorClassName="truncateText"
            position="bottom"
            content={nameTooltipContent}
          >
            <>{nameContent}</>
          </RiTooltip>
        </div>
      </Text>
    </div>
  )
}

export default KeyRowName
