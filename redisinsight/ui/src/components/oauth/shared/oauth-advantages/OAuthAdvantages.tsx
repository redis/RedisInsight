import React from 'react'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiImage } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <RiImage src={RedisLogo} alt="Redis logo" $size="s" />
    <Title size="M">Cloud</Title>
    <Spacer size="space600" />
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <Text
          component="div"
          className={styles.advantage}
          key={title?.toString()}
        >
          <RiIcon type="CheckThinIcon" className={styles.advantageIcon} />
          <Text size="S">{title}</Text>
        </Text>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
