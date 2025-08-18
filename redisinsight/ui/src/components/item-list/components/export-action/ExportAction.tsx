import React, { useState } from 'react'

import { RiPrimaryButton, RiFormField, RiCheckbox } from 'uiBase/forms'
import { ExportIcon, RiIcon } from 'uiBase/icons'
import { RiFlexItem, RiRow } from 'uiBase/layout'

import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
import { formatLongName } from 'uiSrc/utils'
import styles from '../styles.module.scss'

export interface Props<T> {
  selection: T[]
  onExport: (instances: T[], withSecrets: boolean) => void
  subTitle: string
}

const ExportAction = <T extends { id: string; name?: string }>(
  props: Props<T>,
) => {
  const { selection, onExport, subTitle } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [withSecrets, setWithSecrets] = useState(true)

  const exportBtn = (
    <RiPrimaryButton
      onClick={() => setIsPopoverOpen((prevState) => !prevState)}
      size="small"
      icon={ExportIcon}
      className={styles.actionBtn}
      data-testid="export-btn"
    >
      Export
    </RiPrimaryButton>
  )

  return (
    <RiPopover
      id="exportPopover"
      ownFocus
      button={exportBtn}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="l"
      data-testid="export-popover"
    >
      <RiText size="m" className={styles.popoverSubTitle}>
        {subTitle}
      </RiText>
      <div className={styles.boxSection}>
        {selection.map((select) => (
          <RiRow key={select.id} gap="s" className={styles.nameList}>
            <RiFlexItem>
              <RiIcon type="CheckThinIcon" />
            </RiFlexItem>
            <RiFlexItem grow className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </RiFlexItem>
          </RiRow>
        ))}
      </div>
      <RiFormField style={{ marginTop: 16 }}>
        <RiCheckbox
          id="export-passwords"
          name="export-passwords"
          label="Export passwords"
          checked={withSecrets}
          onChange={(e) => setWithSecrets(e.target.checked)}
          data-testid="export-passwords"
        />
      </RiFormField>
      <div className={styles.popoverFooter}>
        <RiPrimaryButton
          size="small"
          icon={ExportIcon}
          onClick={() => {
            setIsPopoverOpen(false)
            onExport(selection, withSecrets)
          }}
          data-testid="export-selected-dbs"
        >
          Export
        </RiPrimaryButton>
      </div>
    </RiPopover>
  )
}

export default ExportAction
