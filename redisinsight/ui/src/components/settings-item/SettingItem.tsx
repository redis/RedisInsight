import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiNumericInput } from 'uiSrc/components/base/inputs'
import { EditIcon } from 'uiSrc/components/base/icons'
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
      <Title className={styles.title} size="XS">
        {title}
      </Title>
      <RiSpacer size="s" />
      <Text className={styles.smallText} size="s">
        {summary}
      </Text>
      <RiSpacer size="m" />
      <RiRow align="center" className={styles.container}>
        <RiFlexItem style={{ marginRight: '4px' }}>
          <Text size="xs" className={styles.inputLabel}>
            {label}
          </Text>
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
            <Text className={styles.value} data-testid={`${testid}-value`}>
              {value}
            </Text>
          )}
        </RiFlexItem>
      </RiRow>
      <RiSpacer size="m" />
    </>
  )
}

export default SettingItem
