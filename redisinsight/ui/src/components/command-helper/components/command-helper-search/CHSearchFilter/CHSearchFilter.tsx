import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { GROUP_TYPES_DISPLAY } from 'uiSrc/constants'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { Text } from 'uiSrc/components/base/text'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  submitFilter: (type: string) => void
  isLoading?: boolean
}

const CHSearchFilter = ({ submitFilter, isLoading }: Props) => {
  const { commandGroups = [] } = useSelector(appRedisCommandsSelector)
  const { isEnteringCommand, matchedCommand, searchingCommandFilter } =
    useSelector(cliSettingsSelector)

  const [typeSelected, setTypeSelected] = useState<string>(
    searchingCommandFilter,
  )

  useEffect(() => {
    if (isEnteringCommand && matchedCommand) {
      setTypeSelected('')
    }
  }, [isEnteringCommand])

  useEffect(() => {
    matchedCommand && setTypeSelected('')
  }, [matchedCommand])

  const groupOptions = [...commandGroups].sort().map((group: string) => ({
    text: (GROUP_TYPES_DISPLAY as any)[group] || group.replace(/_/g, ' '),
    value: group,
  }))

  const options = groupOptions.map((item) => {
    const { value, text } = item
    return {
      label: text,
      value,
      inputDisplay: (
        <Text
          data-test-subj={`filter-option-group-type-${value}`}
          className={cx(styles.selectedType, 'text-capitalize')}
          size="s"
        >
          {text}
        </Text>
      ),
      dropdownDisplay: (
        <Text
          data-test-subj={`filter-option-group-type-${value}`}
          className="text-capitalize"
        >
          {text}
        </Text>
      ),
    }
  })

  const onChangeType = (initValue: string) => {
    const value = typeSelected === initValue ? '' : initValue
    setTypeSelected(value)
    submitFilter(value)
  }

  return (
    <div className={styles.container}>
      <RiSelect
        loading={isLoading}
        disabled={isLoading}
        options={options}
        allowReset
        placeholder={
          <div role="presentation">
            <RiIcon
              type="FilterIcon"
              data-testid="filter-option--group-type-default"
              className={styles.controlsIcon}
            />
          </div>
        }
        value={typeSelected}
        data-testid="select-filter-group-type"
        onChange={(value: string) => onChangeType(value)}
        valueRender={({ option, isOptionValue }) => {
          if (isOptionValue) {
            return option.inputDisplay
          }
          return option.dropdownDisplay
        }}
      />
    </div>
  )
}

export default CHSearchFilter
