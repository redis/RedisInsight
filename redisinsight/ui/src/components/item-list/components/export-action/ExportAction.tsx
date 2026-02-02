import React, { useState } from 'react'

import { formatLongName } from 'uiSrc/utils'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { ExportIcon } from 'uiSrc/components/base/icons'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

import { Text } from 'uiSrc/components/base/text'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiPopover } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from '../ItemListAction.styles'

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
    <S.ActionBtn
      as={PrimaryButton}
      onClick={() => setIsPopoverOpen((prevState) => !prevState)}
      size="small"
      icon={ExportIcon}
      data-testid="export-btn"
    >
      Export
    </S.ActionBtn>
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
      <S.PopoverSubTitle as={Text} size="m">
        {subTitle}
      </S.PopoverSubTitle>
      <S.BoxSection>
        {selection.map((select) => (
          <S.NameList key={select.id} gap="s">
            <FlexItem>
              <RiIcon type="CheckThinIcon" />
            </FlexItem>
            <S.NameListText as={FlexItem} grow>
              <span>{formatLongName(select.name)}</span>
            </S.NameListText>
          </S.NameList>
        ))}
      </S.BoxSection>
      <FormField style={{ marginTop: 16 }}>
        <Checkbox
          id="export-passwords"
          name="export-passwords"
          label="Export passwords"
          checked={withSecrets}
          onChange={(e) => setWithSecrets(e.target.checked)}
          data-testid="export-passwords"
        />
      </FormField>
      <S.PopoverFooter>
        <PrimaryButton
          size="small"
          icon={ExportIcon}
          onClick={() => {
            setIsPopoverOpen(false)
            onExport(selection, withSecrets)
          }}
          data-testid="export-selected-dbs"
        >
          Export
        </PrimaryButton>
      </S.PopoverFooter>
    </RiPopover>
  )
}

export default ExportAction
