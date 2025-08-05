import React, { useState } from 'react'
import cx from 'classnames'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import Download from 'uiSrc/pages/rdi/instance/components/download'
import { RiCol, RiFlexItem } from 'uiSrc/components/base/layout'
import { RiEmptyButton, RiIconButton } from 'uiSrc/components/base/forms'
import { UploadIcon, MoreactionsIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base'
import FetchPipelinePopover from '../fetch-pipeline-popover'

import styles from './styles.module.scss'

const RdiConfigFileActionMenu = () => {
  const [isPopoverOpen, setPopover] = useState(false)

  const onButtonClick = () => {
    setPopover(!isPopoverOpen)
  }

  const closePopover = () => {
    setPopover(false)
  }

  const button = (
    <RiIconButton
      className={styles.threeDotsBtn}
      role="button"
      icon={MoreactionsIcon}
      onClick={onButtonClick}
      data-testid="rdi-config-file-action-menu-trigger"
      aria-label="rdi-config-file-action-menu-trigger"
    />
  )

  return (
    <RiPopover
      id="rdiConfigFileActionsMenu"
      initialFocus={false}
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelClassName={cx('popoverLikeTooltip', styles.popoverWrapper)}
      panelPaddingSize="none"
      anchorPosition="upRight"
    >
      <RiCol align="start">
        <RiFlexItem grow>
          <FetchPipelinePopover onClose={closePopover} />
        </RiFlexItem>
        <RiFlexItem grow>
          <UploadModal onClose={closePopover}>
            <RiEmptyButton
              color="text"
              className={styles.uploadBtn}
              icon={UploadIcon}
              aria-labelledby="Upload pipeline button"
              data-testid="upload-file-btn"
            >
              Upload from file
            </RiEmptyButton>
          </UploadModal>
        </RiFlexItem>
        <RiFlexItem grow>
          <Download onClose={closePopover} />
        </RiFlexItem>
      </RiCol>
    </RiPopover>
  )
}

export default RdiConfigFileActionMenu
