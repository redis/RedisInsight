import React, { useState, useEffect } from 'react'
import cx from 'classnames'

import * as keys from 'uiSrc/constants/keys'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Maybe, Nullable } from 'uiSrc/utils'
import { SearchIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
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
      <IconButton
        icon={SearchIcon}
        aria-label={`Search ${fieldName}`}
        onClick={handleOpen}
        data-testid="search-button"
      />
      <div
        className={cx(styles.search)}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <SearchInput
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
