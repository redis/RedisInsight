import cx from 'classnames'
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

import { RiFlexItem, RiGrid } from 'uiSrc/components/base/layout'
import { RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import styles from './styles.module.scss'

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
    !ttlIsEditing ? (
      <RiIcon
        className={styles.iconPencil}
        type="EditIcon"
        color="informative400"
      />
    ) : (
      ''
    )

  return (
    <RiFlexItem
      onMouseEnter={onMouseEnterTTL}
      onMouseLeave={onMouseLeaveTTL}
      onClick={onClickTTL}
      className={styles.flexItemTTL}
      data-testid="edit-ttl-btn"
    >
      <>
        {(ttlIsEditing || ttlIsHovering) && (
          <RiGrid
            columns={2}
            responsive={false}
            gap="none"
            className={styles.ttlGridComponent}
            data-testid="edit-ttl-grid"
          >
            <RiFlexItem>
              <RiText color="subdued" size="s" className={styles.subtitleText}>
                TTL:
              </RiText>
            </RiFlexItem>
            <RiFlexItem grow>
              <InlineItemEditor
                onApply={() => applyEditTTL()}
                onDecline={(event) => cancelEditTTl(event)}
                viewChildrenMode={!ttlIsEditing}
                isLoading={loading}
                declineOnUnmount={false}
              >
                <RiTextInput
                  name="ttl"
                  id="ttl"
                  className={cx(
                    styles.ttlInput,
                    ttlIsEditing && styles.editing,
                  )}
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
            </RiFlexItem>
          </RiGrid>
        )}
        <RiText
          color="subdued"
          size="s"
          className={cx(styles.subtitleText, {
            [styles.hidden]: ttlIsEditing || ttlIsHovering,
          })}
          data-testid="key-ttl-text"
        >
          TTL:
          <span className={styles.ttlTextValue}>
            {ttl === '-1' ? 'No limit' : ttl}
          </span>
        </RiText>
      </>
    </RiFlexItem>
  )
}

export { KeyDetailsHeaderTTL }
