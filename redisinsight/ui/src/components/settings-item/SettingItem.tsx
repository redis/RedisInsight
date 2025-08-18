import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiTitle, RiText } from 'uiBase/text'
import { RiNumericInput } from 'uiBase/inputs'
import { EditIcon } from 'uiBase/icons'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import styles from './styles.module.scss'

export interface Props {
  initValue: string
  testid: string
  placeholder: string
  label: string
  title: string
  summary: string | JSX.Element
  onApply: (value: string) => void
  validation: (value: string) => string
}

const SettingItem = (props: Props) => {
  const {
    initValue,
    title,
    summary,
    testid,
    placeholder,
    label,
    onApply,
    validation = (val: string) => val,
  } = props

  const [value, setValue] = useState<string>(initValue)
  const [isEditing, setEditing] = useState<boolean>(false)
  const [isHovering, setHovering] = useState<boolean>(false)

  useEffect(() => {
    setValue(initValue)
  }, [initValue])

  const handleApplyChanges = () => {
    setEditing(false)
    setHovering(false)

    onApply(value)
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(initValue)
    setEditing(false)
    setHovering(false)
  }

  return (
    <>
      <RiTitle className={styles.title} size="XS">
        {title}
      </RiTitle>
      <RiSpacer size="s" />
      <RiText className={styles.smallText} size="s">
        {summary}
      </RiText>
      <RiSpacer size="m" />
      <RiRow align="center" className={styles.container}>
        <RiFlexItem style={{ marginRight: '4px' }}>
          <RiText size="xs" className={styles.inputLabel}>
            {label}
          </RiText>
        </RiFlexItem>

        <RiFlexItem
          onMouseEnter={() => !isEditing && setHovering(true)}
          onMouseLeave={() => !isEditing && setHovering(false)}
          onClick={() => setEditing(true)}
          style={{ width: '200px' }}
        >
          {isEditing || isHovering ? (
            <InlineItemEditor
              controlsPosition="right"
              viewChildrenMode={!isEditing}
              onApply={handleApplyChanges}
              onDecline={handleDeclineChanges}
              declineOnUnmount={false}
            >
              <div
                className={cx({
                  [styles.inputHover]: isHovering,
                })}
              >
                <RiNumericInput
                  autoValidate
                  onChange={(value) =>
                    isEditing &&
                    setValue(validation(value ? value.toString() : ''))
                  }
                  value={Number(value)}
                  placeholder={placeholder}
                  aria-label={testid?.replaceAll?.('-', ' ')}
                  className={cx(styles.input, {
                    [styles.inputEditing]: isEditing,
                  })}
                  readOnly={!isEditing}
                  data-testid={`${testid}-input`}
                  style={{ width: '100%' }}
                />
                {!isEditing && <EditIcon />}
              </div>
            </InlineItemEditor>
          ) : (
            <RiText className={styles.value} data-testid={`${testid}-value`}>
              {value}
            </RiText>
          )}
        </RiFlexItem>
      </RiRow>
      <RiSpacer size="m" />
    </>
  )
}

export default SettingItem
