import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { toNumber } from 'lodash'

import { Text } from 'uiSrc/components/base/text'
import { KeyTypes } from 'uiSrc/constants'
import {
  bufferToString,
  formatNameShort,
  isVersionHigherOrEquals,
  validateCountNumber,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import HelpTexts from 'uiSrc/constants/help-texts'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'

import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { deleteListElementsAction } from 'uiSrc/slices/browser/list'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

import { AddListFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  RiSelect,
} from 'uiSrc/components/base/forms'
import { DeleteIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import { DeleteListElementsDto } from 'apiSrc/modules/browser/list/dto'

import {
  HEAD_DESTINATION,
  ListElementDestination,
  TAIL_DESTINATION,
} from '../add-list-elements/AddListElements'

import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
  onRemoveKey: () => void
}

const optionsDestinations = [
  {
    value: TAIL_DESTINATION,
    label: 'Remove from tail',
  },
  {
    value: HEAD_DESTINATION,
    label: 'Remove from head',
  },
]

const RemoveListElements = (props: Props) => {
  const { closePanel, onRemoveKey } = props

  const [count, setCount] = useState<string>('')
  const [destination, setDestination] =
    useState<ListElementDestination>(TAIL_DESTINATION)
  const [isFormValid, setIsFormValid] = useState<boolean>(true)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)
  const [canRemoveMultiple, setCanRemoveMultiple] = useState<boolean>(true)
  const { name: selectedKey = '', length } = useSelector(
    selectedKeyDataSelector,
  ) ?? {
    name: undefined,
    length: 0,
  }
  const { version: databaseVersion = '' } = useSelector(
    connectedInstanceOverviewSelector,
  )
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const countInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    // ComponentDidMount
    countInput.current?.focus()
  }, [])

  useEffect(() => {
    setIsFormValid(toNumber(count) > 0)
  }, [count])

  useEffect(() => {
    if (
      !isVersionHigherOrEquals(
        databaseVersion,
        CommandsVersions.REMOVE_MULTIPLE_LIST_ELEMENTS.since,
      )
    ) {
      setCount('1')
      setCanRemoveMultiple(false)
    }
  }, [databaseVersion])

  const handleCountChange = (value: string) => {
    setCount(validateCountNumber(value))
  }

  const showPopover = () => {
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.List,
      },
    })
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const onSuccessRemoved = (newTotal: number) => {
    if (newTotal <= 0) onRemoveKey()
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.List,
        numberOfRemoved: toNumber(count),
      },
    })
  }

  const submitData = (): void => {
    const data: DeleteListElementsDto = {
      keyName: selectedKey,
      count: toNumber(count),
      destination,
    }
    closePopover()
    dispatch(deleteListElementsAction(data, onSuccessRemoved))
  }

  const RemoveButton = () => (
    <RiPopover
      anchorPosition="upCenter"
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <RiPrimaryButton
          onClick={showPopover}
          disabled={!isFormValid}
          data-testid="remove-elements-btn"
        >
          Remove
        </RiPrimaryButton>
      }
    >
      <div className={styles.popover}>
        <Text size="m" component="div">
          <h4 style={{ marginTop: 0 }}>
            <b>{count}</b> Element(s)
          </h4>
          <Text size="s">
            will be removed from the {destination.toLowerCase()} of{' '}
            <b>{formatNameShort(bufferToString(selectedKey))}</b>
          </Text>
          {(!length || length <= +count) && (
            <div className={styles.appendInfo}>
              <RiIcon
                type="ToastDangerIcon"
                style={{ marginRight: '1rem', marginTop: '4px' }}
              />
              <Text size="s">
                If you remove all Elements, the whole Key will be deleted.
              </Text>
            </div>
          )}
        </Text>
        <RiSpacer />
        <RiDestructiveButton
          size="small"
          onClick={submitData}
          icon={DeleteIcon}
          className={styles.popoverDeleteBtn}
          data-testid="remove-submit"
        >
          Remove
        </RiDestructiveButton>
      </div>
    </RiPopover>
  )

  const InfoBoxPopover = () => (
    <RiPopover
      panelClassName={cx('popoverLikeTooltip')}
      anchorPosition="leftCenter"
      isOpen={isInfoPopoverOpen}
      closePopover={() => setIsInfoPopoverOpen(false)}
      button={
        <RiIcon
          className={styles.infoIcon}
          type="InfoIcon"
          onClick={() =>
            setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)
          }
          style={{ cursor: 'pointer' }}
          data-testid="info-tooltip-icon"
        />
      }
    >
      <div className={styles.popover}>
        {HelpTexts.REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT}
      </div>
    </RiPopover>
  )

  return (
    <>
      <div className={styles.content}>
        <RiFlexItem grow>
          <RiRow align="center">
            <RiFlexItem style={{ minWidth: '220px' }}>
              <RiFormField>
                <RiSelect
                  style={{
                    height: 43,
                  }}
                  value={destination}
                  options={optionsDestinations}
                  onChange={(value) =>
                    setDestination(value as ListElementDestination)
                  }
                  data-testid="destination-select"
                />
              </RiFormField>
            </RiFlexItem>
            <RiFlexItem grow style={{ width: '100%' }}>
              <RiFormField
                additionalText={!canRemoveMultiple ? InfoBoxPopover() : <></>}
              >
                <RiTextInput
                  name={config.count.name}
                  id={config.count.name}
                  maxLength={200}
                  placeholder={config.count.placeholder}
                  value={count}
                  data-testid="count-input"
                  autoComplete="off"
                  onChange={handleCountChange}
                  ref={countInput}
                  disabled={!canRemoveMultiple}
                />
              </RiFormField>
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </div>
      <>
        <RiRow justify="end" gap="xl" style={{ padding: 18 }}>
          <RiFlexItem>
            <div>
              <RiSecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-elements-btn"
              >
                Cancel
              </RiSecondaryButton>
            </div>
          </RiFlexItem>
          <RiFlexItem>
            <div>{RemoveButton()}</div>
          </RiFlexItem>
        </RiRow>
      </>
    </>
  )
}

export { RemoveListElements }
