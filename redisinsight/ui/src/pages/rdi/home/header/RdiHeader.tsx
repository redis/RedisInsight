import React from 'react'
import { useSelector } from 'react-redux'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
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
