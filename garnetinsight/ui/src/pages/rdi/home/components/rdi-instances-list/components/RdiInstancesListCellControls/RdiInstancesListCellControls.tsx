import React, { useState } from 'react'

import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon, MoreactionsIcon } from 'uiSrc/components/base/icons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { formatLongName } from 'uiSrc/utils'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { RiPopover } from 'uiSrc/components'
import { useRdiPageDataProvider } from 'uiSrc/pages/rdi/home/contexts/RdiPageDataProvider'
import { dispatch } from 'uiSrc/slices/store'
import { deleteInstancesAction } from 'uiSrc/slices/rdi/instances'
import { IRdiListCell } from '../../RdiInstancesList.types'

const suffix = '_rdi_instance'

const handleClickDeleteInstance = (id: string) => {
  sendEventTelemetry({
    event: TelemetryEvent.RDI_INSTANCE_SINGLE_DELETE_CLICKED,
    eventData: { id },
  })
}

const RdiInstancesListCellControls: IRdiListCell = ({ row }) => {
  const instance = row.original as RdiInstance
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false)
  const { setEditInstance, setIsConnectionFormOpen } = useRdiPageDataProvider()

  const deletingId = isDeletePopoverOpen ? `${instance.id + suffix}` : ''
  const closePopover = () => setIsDeletePopoverOpen(false)
  const showPopover = () => setIsDeletePopoverOpen(true)

  const handleClickEditInstance = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setEditInstance(instance)
    setIsConnectionFormOpen(true)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteInstancesAction([instance], () => setEditInstance(null)))
  }

  return (
    <Row
      justify="end"
      align="center"
      gap="xs"
      onClick={(e) => e.stopPropagation()}
    >
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
            aria-label="Edit instance"
            onClick={handleClickEditInstance}
            data-testid={`edit-instance-${instance.id}`}
          >
            Edit endpoint
          </EmptyButton>
          <PopoverDelete
            header={formatLongName(instance.name, 50, 10, '...')}
            text="will be removed from Garnetinsight."
            item={instance.id}
            suffix={suffix}
            deleting={deletingId}
            closePopover={closePopover}
            updateLoading={false}
            showPopover={showPopover}
            handleDeleteItem={handleConfirmDelete}
            handleButtonClick={() => handleClickDeleteInstance(instance.id)}
            testid={`delete-instance-${instance.id}`}
            buttonLabel="Remove instance"
          />
        </Col>
      </RiPopover>
    </Row>
  )
}

export default RdiInstancesListCellControls
