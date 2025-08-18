import React, { useState, useEffect } from 'react'
import cx from 'classnames'

import { RiSearchInput } from 'uiBase/inputs'
import { SearchIcon } from 'uiBase/icons'
import { RiIconButton } from 'uiBase/forms'
import { Maybe, Nullable } from 'uiSrc/utils'
import * as keys from 'uiSrc/constants/keys'
import styles from './styles.module.scss'

export interface Props {
  isOpen: boolean
  appliedValue: string
  initialValue?: string
  handleOpenState: (isOpen: boolean) => void
  fieldName: string
  onApply?: (value: string) => void
  searchValidation?: Maybe<(value: string) => string>
}

const TableColumnSearchTrigger = (props: Props) => {
  const {
    isOpen,
    handleOpenState,
    fieldName,
    appliedValue,
    initialValue = '',
    onApply = () => {},
    searchValidation,
  } = props
  const [inputEl, setInputEl] = useState<Nullable<HTMLInputElement>>(null)
  const [value, setValue] = useState<string>(initialValue)

  useEffect(() => {
    if (isOpen && !!inputEl) {
      inputEl.focus()
    }
  }, [isOpen])

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleOpen = () => {
    handleOpenState(true)
  }

  const handleApply = (_value: string): void => {
    if (appliedValue !== _value) {
      onApply(_value)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER) {
      handleApply(value)
    }
  }

  return (
    <div style={{ paddingRight: 10 }}>
      <RiIconButton
        icon={SearchIcon}
        aria-label={`Search ${fieldName}`}
        onClick={handleOpen}
        data-testid="search-button"
      />
      <div
        className={cx(styles.search)}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <RiSearchInput
          onKeyDown={onKeyDown}
          // onBlur={handleOnBlur}
          ref={setInputEl}
          name={fieldName}
          placeholder="Search"
          value={value || ''}
          onChange={handleChangeValue}
          data-testid="search"
        />
      </div>
    </div>
  )
}

export default TableColumnSearchTrigger
