import React from 'react'
import { useSelector } from 'react-redux'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiPrimaryButton } from 'uiBase/forms'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  return (
    <div className="containerDl">
      <RiRow className="contentDL" align="center" gap="s">
        <RiFlexItem>
          <RiPrimaryButton
            onClick={onRdiInstanceClick}
            data-testid="rdi-instance"
          >
            <span>+ Endpoint</span>
          </RiPrimaryButton>
        </RiFlexItem>
        {instances.length > 0 && (
          <RiFlexItem className="searchContainer">
            <SearchRdiList />
          </RiFlexItem>
        )}
      </RiRow>
      <RiSpacer className="spacerDl" />
    </div>
  )
}

export default RdiHeader
