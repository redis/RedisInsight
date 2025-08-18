import React, { useState } from 'react'
import cx from 'classnames'
import { RiCol, RiFlexItem } from 'uiBase/layout'
import { RiEmptyButton, RiIconButton } from 'uiBase/forms'
import { UploadIcon, MoreactionsIcon } from 'uiBase/icons'
import { RiPopover } from 'uiBase/index'
import Download from 'uiSrc/pages/rdi/instance/components/download'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
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
