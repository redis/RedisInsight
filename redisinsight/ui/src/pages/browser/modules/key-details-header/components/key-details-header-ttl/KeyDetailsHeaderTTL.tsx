import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  initialKeyInfo,
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { MAX_TTL_NUMBER, validateTTLNumber } from 'uiSrc/utils'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './KeyDetailsHeaderTTL.styles'

export interface Props {
  onEditTTL: (key: RedisResponseBuffer, ttl: number) => void
}

const KeyDetailsHeaderTTL = ({ onEditTTL }: Props) => {
  const { loading } = useSelector(selectedKeySelector)
  const {
    ttl: ttlProp,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo

  const [ttl, setTTL] = useState(`${ttlProp}`)
  const [ttlIsEditing, setTTLIsEditing] = useState(false)
  const [ttlIsHovering, setTTLIsHovering] = useState(false)

  useEffect(() => {
    setTTL(`${ttlProp}`)
  }, [keyProp, ttlProp, keyBuffer])

  const onMouseEnterTTL = () => {
    setTTLIsHovering(true)
  }

  const onMouseLeaveTTL = () => {
    setTTLIsHovering(false)
  }

  const onClickTTL = () => {
    setTTLIsEditing(true)
  }

  const onChangeTtl = (value: string) => {
    ttlIsEditing && setTTL(validateTTLNumber(value) || '-1')
  }

  const applyEditTTL = () => {
    const ttlValue = ttl || '-1'

    setTTLIsEditing(false)
    setTTLIsHovering(false)

    if (`${ttlProp}` !== ttlValue && keyBuffer) {
      onEditTTL(keyBuffer, +ttlValue)
    }
  }

  const cancelEditTTl = (event: any) => {
    setTTL(`${ttlProp}`)
    setTTLIsEditing(false)
    setTTLIsHovering(false)

    event?.stopPropagation()
  }

  const appendTTLEditing = () =>
    !ttlIsEditing ? <RiIcon type="EditIcon" color="informative400" /> : ''

  return (
    <S.FlexItemTTL
      onMouseEnter={onMouseEnterTTL}
      onMouseLeave={onMouseLeaveTTL}
      onClick={onClickTTL}
      data-testid="edit-ttl-btn"
    >
      <>
        {(ttlIsEditing || ttlIsHovering) && (
          <S.TTLGridComponent
            columns={2}
            responsive={false}
            gap="s"
            data-testid="edit-ttl-grid"
          >
            <FlexItem>
              <S.SubtitleText size="s">TTL:</S.SubtitleText>
            </FlexItem>
            <FlexItem grow>
              <InlineItemEditor
                onApply={() => applyEditTTL()}
                onDecline={(event) => cancelEditTTl(event)}
                viewChildrenMode={!ttlIsEditing}
                isLoading={loading}
                declineOnUnmount={false}
              >
                <S.TTLInput
                  name="ttl"
                  id="ttl"
                  $isEditing={ttlIsEditing}
                  maxLength={200}
                  placeholder="No limit"
                  value={ttl === '-1' ? '' : ttl}
                  fullWidth={false}
                  compressed
                  min={0}
                  max={MAX_TTL_NUMBER}
                  isLoading={loading}
                  onChange={onChangeTtl}
                  append={appendTTLEditing()}
                  autoComplete="off"
                  data-testid="edit-ttl-input"
                />
              </InlineItemEditor>
            </FlexItem>
          </S.TTLGridComponent>
        )}
        <S.SubtitleTextTTL
          size="s"
          $hidden={ttlIsEditing || ttlIsHovering}
          data-testid="key-ttl-text"
        >
          TTL:
          <S.TTLTextValue>{ttl === '-1' ? 'No limit' : ttl}</S.TTLTextValue>
        </S.SubtitleTextTTL>
      </>
    </S.FlexItemTTL>
  )
}

export { KeyDetailsHeaderTTL }
