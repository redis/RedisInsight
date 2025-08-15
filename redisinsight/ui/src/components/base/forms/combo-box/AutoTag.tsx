import React, { useEffect, useState } from 'react'
import { Chip, FormField, Input } from '@redis-ui/components'
import cn from 'classnames'
import styled from 'styled-components'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { CommonProps } from 'uiSrc/components/base/theme/types'
import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export type AutoTagOption<T = string | number | string[] | undefined> = {
  label: string
  key?: string
  value?: T
}
export type AutoTagProps = Omit<
  React.ComponentProps<typeof FormField>,
  'children' | 'onChange'
> &
  CommonProps & {
    isClearable?: boolean
    placeholder?: string
    delimiter?: string
    selectedOptions?: AutoTagOption[]
    onCreateOption?: (value: string, options?: AutoTagOption[]) => void
    onChange?: (value: AutoTagOption[]) => void
    size?: 'S' | 'M'
    full?: boolean
  }

export function getTagFromValue(value: string, delimiter: string) {
  const delimiterFirstIndex = value.indexOf(delimiter)
  if (delimiterFirstIndex > -1) {
    const firstValue = value.slice(0, delimiterFirstIndex)
    if (firstValue !== '') {
      return firstValue
    }
  }
  return null
}

export function filterOptions(
  selection: AutoTagOption[],
  value?: AutoTagOption['value'],
  label?: AutoTagOption['label'],
) {
  // remove option from selection
  return selection.filter((option) => {
    if (value) return option.value !== value
    if (label) return option.label !== label
    return false
  })
}

const ClearButton = ({
  onClick,
  shouldRender,
}: {
  onClick: () => void
  shouldRender: boolean
}) => {
  if (!shouldRender) {
    return null
  }
  return (
    <IconButton
      data-test-subj="autoTagClearButton"
      title="Clear"
      style={{
        position: 'absolute',
        right: '4px',
        top: 'calc(50% - 10px)',
      }}
      icon={CancelSlimIcon}
      onClick={onClick}
    />
  )
}

export const AutoTag = ({
  className,
  isClearable = false,
  placeholder,
  selectedOptions,
  onCreateOption,
  delimiter = '',
  onChange,
  style,
  size = 'S',
  full = false,
  ...rest
}: AutoTagProps) => {
  const [selection, setSelection] = useState<AutoTagOption[]>([])
  useEffect(() => {
    if (selectedOptions) {
      setSelection(selectedOptions)
    }
  }, [selectedOptions])
  const [tag, setTag] = useState('')
  const createOption = (value: string) => {
    // create a new option
    const newOption = {
      label: value,
      value,
    }
    // add the new option to options
    setTag('')
    const newSelection = [...selection, newOption]
    setSelection(newSelection)
    // add the new option to selection
    onCreateOption?.(value, newSelection)
  }
  const handleInputChange = (value: string) => {
    const tag = getTagFromValue(value, delimiter)
    if (tag !== null) {
      createOption(tag)
      return
    }
    setTag(value)
  }
  const handleEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // todo: replace when keys constants are in scope
    if (e.key === 'Enter') {
      const tag = (e.target as HTMLInputElement).value.trim()
      if (tag === null || tag.length === 0) {
        return
      }
      createOption(tag)
    }
  }

  function getPlaceholder() {
    return selectedOptions?.length && selectedOptions.length > 0
      ? undefined
      : placeholder
  }

  return (
    <FormField
      {...rest}
      className={cn('RI-combo-box', className)}
      style={{
        ...style,
        columnGap: '0.5rem',
        width: full ? '100%' : undefined,
      }}
    >
      <StyledWrapper
        justify="start"
        wrap
        gap="s"
        className="RI-auto-tag__container"
        full
      >
        <Row
          gap="s"
          className="RI-auto-tag__selection"
          wrap
          justify="start"
          grow={false}
          align="center"
          data-test-subj="autoTagWrapper"
        >
          {selection?.map(({ value, label }, idx) => {
            const key = `${label}-${value}-${idx}`
            const text = String(label || value || '')
            return (
              <Chip
                data-test-subj="autoTagChip"
                size={size}
                key={key}
                text={text}
                title={text}
                onClose={() => {
                  // remove option from selection
                  const newSelection = filterOptions(selection, value, label)
                  setSelection(newSelection)
                  // call onChange
                  onChange?.(newSelection)
                }}
              />
            )
          })}
          <Input
            variant="underline"
            autoSize
            placeholder={getPlaceholder()}
            onChange={handleInputChange}
            onKeyDown={handleEnter}
            value={tag}
            data-test-subj="autoTagInput"
          />
          <ClearButton
            onClick={() => {
              setTag('')
              setSelection([])
              // call onChange
              onChange?.([])
            }}
            shouldRender={
              isClearable && (tag.length > 0 || selection.length > 0)
            }
          />
        </Row>
      </StyledWrapper>
    </FormField>
  )
}

const StyledWrapper = styled(Row)`
  position: relative;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral600};
  border-radius: 0.4rem;
  padding: 0.15rem 0.5rem;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`
