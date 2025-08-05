import React, { useState } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  bulkActionsSelector,
  bulkImportDefaultDataAction,
} from 'uiSrc/slices/browser/bulkActions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { PlayFilledIcon, RiIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

export interface Props {
  anchorClassName?: string
  onSuccess?: () => void
}

const LoadSampleData = (props: Props) => {
  const { anchorClassName, onSuccess } = props
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { id } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(bulkActionsSelector)

  const dispatch = useDispatch()

  const handleSampleData = () => {
    setIsConfirmationOpen(false)
    dispatch(bulkImportDefaultDataAction(id, onSuccess))

    sendEventTelemetry({
      event: TelemetryEvent.IMPORT_SAMPLES_CLICKED,
      eventData: {
        databaseId: id,
      },
    })
  }

  return (
    <RiPopover
      ownFocus
      id="load-sample-data-popover"
      anchorPosition="upCenter"
      isOpen={isConfirmationOpen}
      closePopover={() => setIsConfirmationOpen(false)}
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      panelPaddingSize="none"
      anchorClassName={cx(styles.buttonWrapper, anchorClassName)}
      button={
        <RiPrimaryButton
          onClick={() => setIsConfirmationOpen(true)}
          className={styles.loadDataBtn}
          loading={loading}
          disabled={loading}
          data-testid="load-sample-data-btn"
        >
          Load sample data
        </RiPrimaryButton>
      }
    >
      <RiRow gap="m" responsive={false} style={{ padding: 8 }}>
        <RiFlexItem>
          <RiIcon type="ToastDangerIcon" className={styles.popoverIcon} />
        </RiFlexItem>
        <RiFlexItem>
          <Text>Execute commands in bulk</Text>
          <RiSpacer size="s" />
          <Text color="subdued" size="s">
            All commands from the file will be automatically executed against
            your database. Avoid executing them in production databases.
          </Text>
          <RiSpacer size="s" />
          <RiRow justify="end">
            <RiFlexItem>
              <RiPrimaryButton
                size="s"
                icon={PlayFilledIcon}
                iconSide="right"
                color="secondary"
                onClick={handleSampleData}
                data-testid="load-sample-data-btn-confirm"
              >
                Execute
              </RiPrimaryButton>
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </RiRow>
    </RiPopover>
  )
}

export default LoadSampleData
