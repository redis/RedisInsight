import React, { useMemo } from 'react'

import { PersistencePolicy } from 'uiSrc/slices/interfaces'
import { DatabaseListOptionsContainer } from './DatabaseListOptions.styles'
import { Tooltip } from './components/Tooltip'
import { OPTIONS_CONTENT, OptionKey } from './constants'

interface Props {
  options: Partial<any>
}

const DatabaseListOptions = ({ options }: Props) => {
  const optionsRender = useMemo(() => {
    const sortedOptions = Object.entries(options).sort(([option]) => {
      if (OPTIONS_CONTENT[option as OptionKey]?.icon === undefined) {
        return -1
      }
      return 0
    })
    return sortedOptions.map(([option, value]: any, index: number) => {
      if (value && value !== PersistencePolicy.none) {
        return (
          <Tooltip
            key={`${option + index}`}
            icon={OPTIONS_CONTENT[option as OptionKey]?.icon}
            content={OPTIONS_CONTENT[option as OptionKey]?.text}
            value={value}
            index={index}
          />
        )
      }
      return null
    })
  }, [options])

  return (
    <DatabaseListOptionsContainer>{optionsRender}</DatabaseListOptionsContainer>
  )
}

export default DatabaseListOptions
