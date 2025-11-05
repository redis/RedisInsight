import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { FeatureFlagComponent, RiPopover, RiTooltip } from 'uiSrc/components'
import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'

import { IDatabaseListCell } from '../../DatabasesList.types'
import { Link } from 'uiSrc/components/base/link/Link'
import {
  RiIcon,
  TagIcon,
  EditIcon,
  MoreactionsIcon,
} from 'uiSrc/components/base/icons'
import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { formatLongName } from 'uiSrc/utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { HoverableIconButton } from './DatabasesListCellControls.styles'
import {
  OpenDialogName,
  useHomePageDataProvider,
} from 'uiSrc/pages/home/contexts/HomePageDataProvider'
import {
  handleManageInstanceTags,
  handleClickGoToCloud,
  handleClickEditInstance,
  handleDeleteInstances,
  handleClickDeleteInstance,
} from './methods/handlers'

const suffix = '_db_instance'

const DatabasesListCellControls: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { setOpenDialog } = useHomePageDataProvider()
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false)

  const deletingId = isDeletePopoverOpen ? `${instance.id + suffix}` : ''
  const closePopover = () => setIsDeletePopoverOpen(false)
  const showPopover = () => setIsDeletePopoverOpen(true)

  const { [FeatureFlags.databaseManagement]: databaseManagementFeature } =
    useSelector(appFeatureFlagsFeaturesSelector)

  return (
    <Row
      justify="end"
      align="center"
      gap="xs"
      onClick={(e) => e.stopPropagation()}
    >
      {databaseManagementFeature?.flag && (
        <RiTooltip content="Manage Tags">
          <HoverableIconButton
            icon={TagIcon}
            aria-label="Manage Instance Tags"
            data-testid={`manage-instance-tags-${instance.id}`}
            onClick={() => {
              handleManageInstanceTags(instance)
              setOpenDialog(OpenDialogName.ManageTags)
            }}
          />
        </RiTooltip>
      )}
      {instance.cloudDetails && (
        <RiTooltip content="Go to Redis Cloud">
          <Link
            target="_blank"
            href={EXTERNAL_LINKS.cloudConsole}
            onClick={handleClickGoToCloud}
            data-testid={`cloud-link-${instance.id}`}
          >
            <RiIcon type="CloudLinkIcon" fill="currentColor" size={'m'} />
          </Link>
        </RiTooltip>
      )}
      <FeatureFlagComponent name={FeatureFlags.databaseManagement}>
        <RiPopover
          ownFocus
          anchorPosition="leftUp"
          panelPaddingSize="s"
          button={
            <IconButton
              icon={MoreactionsIcon}
              aria-label="Controls icon"
              data-testid={`controls-button-${instance.id}`}
            />
          }
          data-testid={`controls-popover-${instance.id}`}
        >
          <Col>
            <EmptyButton
              justify="start"
              icon={EditIcon}
              className="editInstanceBtn"
              aria-label="Edit instance"
              onClick={() => {
                handleClickEditInstance(instance)
                setOpenDialog(OpenDialogName.EditDatabase) // if instance?
              }}
              data-testid={`edit-instance-${instance.id}`}
            >
              Edit database
            </EmptyButton>
            <PopoverDelete
              header={formatLongName(instance.name, 50, 10, '...')}
              text="will be removed from Redis Insight."
              item={instance.id}
              suffix={suffix}
              deleting={deletingId}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              handleDeleteItem={() => {
                handleDeleteInstances(instance)
                setOpenDialog(null)
              }}
              handleButtonClick={() => handleClickDeleteInstance(instance)}
              testid={`delete-instance-${instance.id}`}
              buttonLabel="Remove database"
            />
          </Col>
        </RiPopover>
      </FeatureFlagComponent>
    </Row>
  )
}

export default DatabasesListCellControls
