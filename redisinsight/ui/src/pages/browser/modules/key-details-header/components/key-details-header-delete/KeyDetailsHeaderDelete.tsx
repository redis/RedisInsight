import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  initialKeyInfo,
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { formatLongName } from 'uiSrc/utils'

import { DeleteIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import { ConfirmationPopover } from 'uiSrc/components'

export interface Props {
  onDelete: (key: RedisResponseBuffer) => void
}

const KeyDetailsHeaderDelete = ({ onDelete }: Props) => {
  const {
    type,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState(false)

  const tooltipContent = formatLongName(keyProp || '')

  const closePopoverDelete = () => {
    setIsPopoverDeleteOpen(false)
  }

  const showPopoverDelete = () => {
    setIsPopoverDeleteOpen((isPopoverDeleteOpen) => !isPopoverDeleteOpen)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        source: 'keyValue',
        keyType: type,
      },
    })
  }

  return (
    <ConfirmationPopover
      key={keyProp}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isPopoverDeleteOpen}
      closePopover={closePopoverDelete}
      panelPaddingSize="l"
      button={
        <IconButton
          icon={DeleteIcon}
          aria-label="Delete Key"
          className="deleteKeyBtn"
          onClick={showPopoverDelete}
          data-testid="delete-key-btn"
        />
      }
      title={tooltipContent}
      message="will be deleted."
      confirmButton={
        <DestructiveButton
          size="small"
          icon={DeleteIcon}
          onClick={() => onDelete(keyBuffer!)}
          data-testid="delete-key-confirm-btn"
        >
          Delete
        </DestructiveButton>
      }
    />
  )
}

export { KeyDetailsHeaderDelete }
