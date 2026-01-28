import { ComponentProps, ReactNode } from 'react'
import { Section, SectionProps } from '@redis-ui/components'

export type RiAccordionProps = Omit<ComponentProps<typeof Section>, 'label'> & {
  label: ReactNode
  actions?: ReactNode
  collapsible?: SectionProps['collapsible']
  actionButtonText?: ReactNode
  content?: SectionProps['content']
  children?: SectionProps['content']
  onAction?: () => void
}

export type RiAccordionActionsProps = Pick<
  RiAccordionProps,
  'actionButtonText' | 'actions' | 'onAction'
>
