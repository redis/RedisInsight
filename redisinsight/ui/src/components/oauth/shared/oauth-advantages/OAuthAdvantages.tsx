import React from 'react'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiImage } from 'uiSrc/components/base/display'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <RiImage className={styles.logo} src={RedisLogo} alt="Redis logo" />
    <RiTitle size="S" className={styles.title}>
      Cloud
    </RiTitle>
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <RiText
          component="div"
          className={styles.advantage}
          key={title?.toString()}
        >
          <RiIcon type="CheckThinIcon" className={styles.advantageIcon} />
          <RiText className={styles.advantageTitle} color="subdued">
            {title}
          </RiText>
        </RiText>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
