import React, { ReactNode } from 'react'
import cx from 'classnames'
import {
  RiAccordion,
  RiAccordionProps,
} from 'uiSrc/components/base/display/accordion/RiAccordion'

export type RiCollapsibleNavGroupProps = Omit<
  RiAccordionProps,
  'collapsible' | 'content' | 'defaultOpen' | 'title' | 'label'
> & {
  title: ReactNode
  children: ReactNode
  isCollapsible?: boolean
  className?: string
  initialIsOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  forceState?: 'open' | 'closed'
}
export const RiCollapsibleNavGroup = ({
  children,
  title,
  isCollapsible = true,
  className,
  initialIsOpen,
  onToggle,
  forceState,
  open,
  ...rest
}: RiCollapsibleNavGroupProps) => (
  <RiAccordion
    {...rest}
    collapsible={isCollapsible}
    className={cx(className, 'RI-collapsible-nav-group')}
    defaultOpen={initialIsOpen}
    open={forceState === 'open' || open}
    label={title}
    onOpenChange={onToggle}
  >
    <div className="RI-collapsible-nav-group-content">{children}</div>
  </RiAccordion>
)
