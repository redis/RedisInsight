import React, { useState } from 'react'

import { formatLongName } from 'uiSrc/utils'

import {
  RiPrimaryButton,
  RiFormField,
  RiCheckbox,
} from 'uiSrc/components/base/forms'
import { ExportIcon, RiIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
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
      <Text size="m" className={styles.popoverSubTitle}>
        {subTitle}
      </Text>
      <div className={styles.boxSection}>
        {selection.map((select) => (
          <Row key={select.id} gap="s" className={styles.nameList}>
            <FlexItem>
              <RiIcon type="CheckThinIcon" />
            </FlexItem>
            <FlexItem grow className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </FlexItem>
          </Row>
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
