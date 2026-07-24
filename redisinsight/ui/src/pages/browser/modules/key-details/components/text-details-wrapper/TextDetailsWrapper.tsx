import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

const TextDetailsWrapper = ({
  onClose,
  children,
  testid,
}: {
  onClose: () => void
  children: ReactNode
  testid?: string
}) => {
  const { t } = useTranslation()
  const getDataTestid = (suffix: string) =>
    testid ? `${testid}-${suffix}` : suffix

  return (
    <div className={styles.container} data-testid={getDataTestid('details')}>
      <RiTooltip
        content={t('browser.keyDetails.textWrapper.closeTooltip')}
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <IconButton
          icon={CancelSlimIcon}
          aria-label={t('browser.keyDetails.textWrapper.closeAria')}
          className={styles.closeBtn}
          onClick={() => onClose()}
          data-testid={getDataTestid('close-key-btn')}
        />
      </RiTooltip>
      <Row centered>
        <FlexItem className={styles.textWrapper}>
          <div>{children}</div>
        </FlexItem>
      </Row>
    </div>
  )
}

export default TextDetailsWrapper
