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
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { RiAccordion } from 'uiSrc/components/base/display'
import { RiCol } from 'uiSrc/components/base/layout'
import { RiTooltip, OnboardingTour } from 'uiSrc/components'
import { RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'

import DeleteTutorialButton from '../DeleteTutorialButton'

import './styles.scss'

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
  isPageOpened?: boolean
  isShowActions?: boolean
  isShowFolder?: boolean
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
    isPageOpened,
    isShowFolder,
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
        (isGroupOpen || forceState === 'open') && (
          <OnboardingTour
            options={ONBOARDING_FEATURES.EXPLORE_CUSTOM_TUTORIALS}
            anchorPosition="downLeft"
            anchorWrapperClassName="onboardingPopoverAnchor"
            panelClassName={cx({ hide: isPageOpened })}
            preventPropagation
          >
            <RiTooltip content="Upload Tutorial">
              <div
                className="group-header__btn group-header__create-btn"
                role="presentation"
                onClick={handleCreate}
                data-testid="open-upload-tutorial-btn"
              >
                <RiIcon type="PlusSlimIcon" />
              </div>
            </RiTooltip>
          </OnboardingTour>
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
        <RiText className="group-header" size="m">
          {isShowFolder && (
            <RiIcon
              type={isGroupOpen ? 'KnowledgeBaseIcon' : 'FolderIcon'}
              style={{ marginRight: '10px' }}
            />
          )}
          {label}
        </RiText>
      }
      onOpenChange={handleOpen}
      style={{
        whiteSpace: 'nowrap',
        width: 'auto',
      }}
      className={cx({ withBorder })}
      actions={isShowActions ? actionsContent : null}
    >
      <RiCol gap="l">{children}</RiCol>
    </RiAccordion>
  )
}

export default Group
