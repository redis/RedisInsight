import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { RiCol, RiFlexItem, RiRow } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiHealthText, RiTitle } from 'uiBase/text'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes } from 'uiSrc/constants'
import HelpTexts from 'uiSrc/constants/help-texts'
import AddKeyCommonFields from 'uiSrc/pages/browser/components/add-key/AddKeyCommonFields/AddKeyCommonFields'
import {
  addKeyStateSelector,
  resetAddKey,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
} from 'uiSrc/telemetry'
import { isContainJSONModule, Maybe, stringToBuffer } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { RiTooltip } from 'uiSrc/components'
import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
import AddKeyHash from './AddKeyHash'
import AddKeyZset from './AddKeyZset'
import AddKeyString from './AddKeyString'
import AddKeySet from './AddKeySet'
import AddKeyList from './AddKeyList'
import AddKeyReJSON from './AddKeyReJSON'
import AddKeyStream from './AddKeyStream'
import { ContentFields } from './AddKey.styles'

import styles from './styles.module.scss'

export interface Props {
  onAddKeyPanel: (value: boolean, keyName?: RedisResponseBuffer) => void
  onClosePanel: () => void
  arePanelsCollapsed?: boolean
}
const AddKey = (props: Props) => {
  const { onAddKeyPanel, onClosePanel, arePanelsCollapsed } = props
  const dispatch = useDispatch()

  const { loading } = useSelector(addKeyStateSelector)
  const { id: instanceId, modules = [] } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType } = useSelector(keysSelector)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        dispatch(resetAddKey())
      },
    [],
  )

  const options = ADD_KEY_TYPE_OPTIONS.map((item) => {
    const { value, color, text } = item
    return {
      value,
      inputDisplay: (
        <RiHealthText
          color={color}
          style={{ lineHeight: 'inherit' }}
          data-test-subj={value}
          data-testid={value}
        >
          {text}
        </RiHealthText>
      ),
    }
  })
  const [typeSelected, setTypeSelected] = useState<string>(options[0].value)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)

  const onChangeType = (value: string) => {
    setTypeSelected(value)
  }

  const closeKeyTelemetry = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_CANCELLED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_CANCELLED,
      ),
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const closeKey = () => {
    onClosePanel()
    closeKeyTelemetry()
  }

  const closeAddKeyPanel = (isCancelled?: boolean) => {
    // meaning that the user closed the "Add Key" panel when clicked on the cancel button
    if (isCancelled) {
      onAddKeyPanel(false)
      onClosePanel()
      closeKeyTelemetry()
    }
    // meaning that the user closed the "Add Key" panel when added a key
    else {
      onAddKeyPanel(false, stringToBuffer(keyName))
    }
  }

  const defaultFields = {
    keyName,
    keyTTL,
  }

  return (
    <div className={styles.page}>
      <RiRow
        justify="center"
        className={cx(styles.contentWrapper, 'relative')}
        gap="none"
      >
        <RiCol justify="center" className={styles.content}>
          <RiFlexItem grow style={{ marginBottom: '36px' }}>
            <RiTitle size="M">New Key</RiTitle>
            {!arePanelsCollapsed && (
              <RiTooltip
                content="Close"
                position="left"
                anchorClassName={styles.closeKeyTooltip}
              >
                <RiIconButton
                  icon={CancelSlimIcon}
                  aria-label="Close key"
                  className={styles.closeBtn}
                  onClick={() => closeKey()}
                />
              </RiTooltip>
            )}
          </RiFlexItem>
          <div className={cx('eui-yScroll', styles.scrollContainer)}>
            <ContentFields>
              <AddKeyCommonFields
                typeSelected={typeSelected}
                onChangeType={onChangeType}
                options={options}
                loading={loading}
                keyName={keyName}
                setKeyName={setKeyName}
                keyTTL={keyTTL}
                setKeyTTL={setKeyTTL}
              />

              <Divider
                colorVariable="separatorColor"
                className={styles.divider}
              />

              {typeSelected === KeyTypes.Hash && (
                <AddKeyHash onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.ZSet && (
                <AddKeyZset onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.Set && (
                <AddKeySet onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.String && (
                <AddKeyString onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.List && (
                <AddKeyList onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.ReJSON && (
                <>
                  {!isContainJSONModule(modules) && (
                    <span
                      className={styles.helpText}
                      data-testid="json-not-loaded-text"
                    >
                      {HelpTexts.REJSON_SHOULD_BE_LOADED}
                    </span>
                  )}
                  <AddKeyReJSON
                    onCancel={closeAddKeyPanel}
                    {...defaultFields}
                  />
                </>
              )}
              {typeSelected === KeyTypes.Stream && (
                <AddKeyStream onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
            </ContentFields>
          </div>
        </RiCol>
        <div id="formFooterBar" className="formFooterBar" />
      </RiRow>
    </div>
  )
}

export default AddKey
