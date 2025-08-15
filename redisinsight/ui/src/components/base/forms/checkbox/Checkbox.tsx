import React, { ChangeEvent } from 'react'
import {
  Checkbox as RedisUiCheckbox,
  CheckedType,
  Typography,
} from '@redis-ui/components'
import { BodySizesType } from '@redis-ui/components/dist/Typography/components/Body/Body.types'

type Size = BodySizesType

export type CheckboxProps = Omit<
  React.ComponentProps<typeof RedisUiCheckbox>,
  'onChange'
> & {
  onCheckedChange?: (checked: CheckedType) => void
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  name?: string
  id?: string
  labelSize?: Size
}

type CheckboxLabelProps = Omit<
  React.ComponentProps<typeof Typography.Body>,
  'children' | 'component'
> & {
  children: React.ReactNode
}

const CheckboxLabel = ({ children, ...rest }: CheckboxLabelProps) => {
  if (typeof children !== 'string') {
    return <>{children}</>
  }
  return (
    <Typography.Body {...rest} component="span">
      {children}
    </Typography.Body>
  )
}

export const Checkbox = ({
  onChange,
  onCheckedChange,
  id,
  label,
  labelSize = 'S',
  ...rest
}: CheckboxProps) => {
  /**
   * Handles the change event for a checkbox input and notifies the relevant handlers.
   *
   * This is added to provide compatibility with the `onChange` handler expected by the Formik library.
   * Constructs a synthetic event object designed to mimic a React checkbox change event.
   * Updates the `checked` status and passes the constructed event to the `onChange` handler
   * if provided. Additionally, invokes the `onCheckedChange` handler with the new `checked` state
   * if it is defined.
   *
   * @param {CheckedType} checked - The new checked state of the checkbox. It is expected to
   *        be a boolean-like value where `true` indicates checked and any other value
   *        indicates unchecked.
   */
  const handleCheckedChange = (checked: CheckedType) => {
    const syntheticEvent = {
      target: {
        checked: checked === true,
        type: 'checkbox',
        name: rest.name,
        id,
      },
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
    onCheckedChange?.(checked)
  }

  return (
    <RedisUiCheckbox
      {...rest}
      id={id}
      onCheckedChange={handleCheckedChange}
      label={<CheckboxLabel size={labelSize}>{label}</CheckboxLabel>}
    />
  )
}
