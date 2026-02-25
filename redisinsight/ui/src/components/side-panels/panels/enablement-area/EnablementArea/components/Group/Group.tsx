import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { EAItemActions } from 'uiSrc/constants'

import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import DeleteTutorialButton from '../DeleteTutorialButton'

import * as S from './Group.styles'

export interface Props {
  id: string
  label: string
  actions?: string[]
  onCreate?: () => void
  onDelete?: (id: string) => void
  children: React.ReactNode
  withBorder?: boolean
  initialIsOpen?: boolean
  forceState?: 'open' | 'closed'
  onToggle?: (isOpen: boolean) => void
  isShowActions?: boolean
  isShowFolder?: boolean
  hasChildren?: boolean
}

const Group = (props: Props) => {
  const {
    label,
    actions,
    isShowActions,
    children,
    id,
    forceState,
    withBorder = false,
    initialIsOpen = false,
    onToggle,
    onCreate,
    onDelete,
    isShowFolder,
    hasChildren = true,
  } = props
  const { deleting: deletingCustomTutorials } = useSelector(
    workbenchCustomTutorialsSelector,
  )
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [isGroupOpen, setIsGroupOpen] = useState<boolean>(initialIsOpen)

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreate?.()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
      },
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const handleOpen = (isOpen: boolean) => {
    if (forceState === 'open') return

    setIsGroupOpen(isOpen)
    onToggle?.(isOpen)
  }

  const actionsContent = (
    <>
      {actions?.includes(EAItemActions.Create) &&
        hasChildren &&
        (isGroupOpen || forceState === 'open') && (
          <RiTooltip content="Upload tutorial">
            <S.GroupHeaderButton
              role="presentation"
              onClick={handleCreate}
              data-testid="open-upload-tutorial-btn"
            >
              <RiIcon type="PlusSlimIcon" size="m" />
            </S.GroupHeaderButton>
          </RiTooltip>
        )}
      {actions?.includes(EAItemActions.Delete) && (
        <DeleteTutorialButton
          id={id}
          label={label}
          onDelete={handleDelete}
          isLoading={deletingCustomTutorials}
        />
      )}
    </>
  )

  return (
    <RiAccordion
      id={id}
      data-testid={`accordion-${id}`}
      defaultOpen={initialIsOpen}
      open={forceState === 'open' || isGroupOpen}
      label={
        <Row align="start" justify="start" gap="m">
          {isShowFolder && (
            <RiIcon
              type={isGroupOpen ? 'FolderOpenIcon' : 'FolderIcon'}
              color="primary500"
            />
          )}
          <RiAccordion.StyledLabel label={label} />
        </Row>
      }
      onOpenChange={handleOpen}
      className={cx({ withBorder })}
      actions={isShowActions ? actionsContent : null}
    >
      <Col gap="l">{children}</Col>
    </RiAccordion>
  )
}

export default Group
