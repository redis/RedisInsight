import React, { useEffect, useState } from 'react'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { NumericInput } from 'uiSrc/components/base/inputs'
import { EditIcon } from 'uiSrc/components/base/icons'
import * as S from './SettingItem.styles'

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
      <Title component="h5" size="S">
        {title}
      </Title>
      <Spacer size="s" />
      <Text size="M">{summary}</Text>
      <Spacer size="m" />
      <S.Container>
        <Row align="center" justify="start" gap="s">
          <FlexItem>
            <Text size="M" variant="semiBold">
              {label}
            </Text>
          </FlexItem>

          <FlexItem
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
                <S.InputHover>
                  <Row align="center" justify="between">
                    <S.Input $isEditing={isEditing}>
                      <NumericInput
                        autoValidate
                        onChange={(val) =>
                          isEditing &&
                          setValue(validation(val ? val.toString() : ''))
                        }
                        value={Number(value)}
                        placeholder={placeholder}
                        aria-label={testid?.replaceAll?.('-', ' ')}
                        readOnly={!isEditing}
                        data-testid={`${testid}-input`}
                        style={{ width: '100%' }}
                      />
                    </S.Input>
                    {!isEditing && <EditIcon />}
                  </Row>
                </S.InputHover>
              </InlineItemEditor>
            ) : (
              <S.Value>
                <Text variant="semiBold" data-testid={`${testid}-value`}>
                  {value}
                </Text>
              </S.Value>
            )}
          </FlexItem>
        </Row>
      </S.Container>
      <Spacer size="m" />
    </>
  )
}

export default SettingItem
