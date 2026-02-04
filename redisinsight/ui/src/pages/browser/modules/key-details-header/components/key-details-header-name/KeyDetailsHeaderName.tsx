import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'
import { useSelector } from 'react-redux'

import { formatLongName, isEqualBuffers, stringToBuffer } from 'uiSrc/utils'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { TEXT_UNPRINTABLE_CHARACTERS } from 'uiSrc/constants'
import { AddCommonFieldsFormConfig } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import {
  initialKeyInfo,
  keysSelector,
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { CopyButton } from 'uiSrc/components/copy-button'
import * as S from './KeyDetailsHeaderName.styles'

export interface Props {
  onEditKey: (
    key: RedisResponseBuffer,
    newKey: RedisResponseBuffer,
    onFailure?: () => void,
  ) => void
}

const COPY_KEY_NAME_ICON = 'copyKeyNameIcon'

const KeyDetailsHeaderName = ({ onEditKey }: Props) => {
  const { loading } = useSelector(selectedKeySelector)
  const {
    ttl: ttlProp,
    type,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [key, setKey] = useState(keyProp)
  const [keyIsEditing, setKeyIsEditing] = useState(false)
  const [keyIsHovering, setKeyIsHovering] = useState(false)
  const [keyIsEditable, setKeyIsEditable] = useState(true)

  useEffect(() => {
    setKey(keyProp)
    setKeyIsEditable(isEqualBuffers(keyBuffer, stringToBuffer(keyProp || '')))
  }, [keyProp, ttlProp, keyBuffer])

  const keyNameRef = useRef<HTMLInputElement>(null)

  const tooltipContent = formatLongName(keyProp || '')

  const onMouseEnterKey = () => {
    setKeyIsHovering(true)
  }

  const onMouseLeaveKey = () => {
    setKeyIsHovering(false)
  }

  const onClickKey = () => {
    setKeyIsEditing(true)
  }

  const onChangeKey = (value: string) => {
    keyIsEditing && setKey(value)
  }

  const applyEditKey = () => {
    setKeyIsEditing(false)
    setKeyIsHovering(false)

    const newKeyBuffer = stringToBuffer(key || '')

    if (
      keyBuffer &&
      !isEqualBuffers(keyBuffer, newKeyBuffer) &&
      !isNull(keyProp)
    ) {
      onEditKey(keyBuffer, newKeyBuffer, () => setKey(keyProp))
    }
  }

  const cancelEditKey = (event?: React.MouseEvent<HTMLElement>) => {
    const { id } = (event?.target as HTMLElement) || {}
    if (id === COPY_KEY_NAME_ICON) {
      return
    }
    setKey(keyProp)
    setKeyIsEditing(false)
    setKeyIsHovering(false)

    event?.stopPropagation()
  }

  const handleCopy = useCallback(() => {
    if (keyIsEditing) {
      keyNameRef?.current?.focus()
    }

    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_COPIED,
        TelemetryEvent.TREE_VIEW_KEY_COPIED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: type,
      },
    })
  }, [keyIsEditing, viewType, instanceId, type])

  return (
    <S.FlexWrapper
      direction="row"
      onMouseEnter={onMouseEnterKey}
      onMouseLeave={onMouseLeaveKey}
      onClick={onClickKey}
      data-testid="edit-key-btn"
    >
      <S.TooltipAnchorKey>
        <RiTooltip title="Key Name" position="left" content={tooltipContent}>
          <InlineItemEditor
            onApply={() => applyEditKey()}
            isDisabled={!keyIsEditable}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={(event) => cancelEditKey(event)}
            viewChildrenMode={!keyIsEditing}
            isLoading={loading}
            declineOnUnmount={false}
          >
            <S.InputWrapper align="center" style={{ maxWidth: 420 }}>
              <S.StyledTextInput
                autoSize
                name="key"
                id="key"
                ref={keyNameRef}
                $isEditing={keyIsEditing}
                className={cx({ 'input-warning': !keyIsEditable })}
                placeholder={AddCommonFieldsFormConfig?.keyName?.placeholder}
                value={key!}
                loading={loading}
                onChange={onChangeKey}
                readOnly={!keyIsEditing}
                autoComplete="off"
                data-testid="edit-key-input"
                style={{ paddingLeft: 9, lineHeight: '31px' }}
              />
            </S.InputWrapper>
          </InlineItemEditor>
        </RiTooltip>
      </S.TooltipAnchorKey>
      {!keyIsEditing && keyIsHovering && (
        <Row align="center">
          <RiIcon size="M" type="EditIcon" />
          <S.CopyKeyWrapper>
            <CopyButton
              copy={key!}
              onCopy={handleCopy}
              id={COPY_KEY_NAME_ICON}
              data-testid="copy-key-name"
              aria-label="Copy Key Name"
            />
          </S.CopyKeyWrapper>
        </Row>
      )}
    </S.FlexWrapper>
  )
}

export { KeyDetailsHeaderName }
