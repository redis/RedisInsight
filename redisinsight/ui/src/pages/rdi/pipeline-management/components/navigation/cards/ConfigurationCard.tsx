import React from 'react'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import BaseCard, { BaseCardProps } from './BaseCard'

export type ConfigurationCardProps = Omit<
  BaseCardProps,
  'title' | 'children' | 'onSelect'
> & {
  onSelect: (id: string | RdiPipelineTabs) => void
}

const ConfigurationCard = ({
  onSelect,
  isSelected,
}: ConfigurationCardProps) => {
  const handleClick = () => {
    onSelect(RdiPipelineTabs.Config)
  }

  return (
    <BaseCard
      title="Configuration"
      isSelected={isSelected}
      tabIndex={0}
      onClick={handleClick}
      data-testid={`rdi-nav-btn-${RdiPipelineTabs.Config}`}
    >
      Configuration file
    </BaseCard>
  )
}

export default ConfigurationCard
