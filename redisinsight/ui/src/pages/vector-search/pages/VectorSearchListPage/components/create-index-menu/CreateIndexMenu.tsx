import React from 'react'

import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MenuDropdownArrow,
} from 'uiSrc/components/base/layout/menu'

import { useVectorSearch } from '../../../../context/vector-search'

export const CreateIndexMenu = () => {
  const { openPickSampleDataModal } = useVectorSearch()

  return (
    <Menu>
      <MenuTrigger>
        <ToggleButton data-testid="vector-search--list--create-index-btn">
          + Create search index
        </ToggleButton>
      </MenuTrigger>
      <MenuContent align="end">
        <MenuItem
          text="Use sample data"
          onClick={openPickSampleDataModal}
          data-testid="vector-search--list--create-index--sample-data"
        />
        <MenuItem
          text="Use existing data"
          disabled
          data-testid="vector-search--list--create-index--existing-data"
        />
        <MenuDropdownArrow />
      </MenuContent>
    </Menu>
  )
}
