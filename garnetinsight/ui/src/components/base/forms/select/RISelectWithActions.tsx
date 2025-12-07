import React from 'react'
import { Select, SelectOption, SelectProps } from '@redis-ui/components'

export type SelectOptionActions = {
  actions?: JSX.Element
}

export type Props = SelectProps & {
  options: (SelectOption & SelectOptionActions)[]
  'data-testid'?: string
}

const CustomOptionWithAction = ({ option, content, ...restProps }: any) => {
  return (
    <Select.Option.Compose option={option} {...restProps}>
      <Select.Option.Content>{content}</Select.Option.Content>
      {option.actions && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {option.actions}
        </div>
      )}
      <Select.Option.Indicator />
    </Select.Option.Compose>
  )
}

export const RISelectWithActions = (props: Props) => {
  const { 'data-testid': dataTestId, ...restProps } = props

  return (
    <Select.Compose {...restProps}>
      <Select.Trigger data-testid={dataTestId} />
      <Select.Content.Compose>
        <Select.Content.OptionList optionComponent={CustomOptionWithAction} />
      </Select.Content.Compose>
    </Select.Compose>
  )
}
