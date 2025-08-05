import React from 'react'
import { useSelector } from 'react-redux'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  return (
    <div className="containerDl">
      <Row className="contentDL" align="center" gap="s">
        <FlexItem>
          <RiPrimaryButton
            onClick={onRdiInstanceClick}
            data-testid="rdi-instance"
          >
            <span>+ Endpoint</span>
          </RiPrimaryButton>
        </FlexItem>
        {instances.length > 0 && (
          <FlexItem className="searchContainer">
            <SearchRdiList />
          </FlexItem>
        )}
      </Row>
      <Spacer className="spacerDl" />
    </div>
  )
}

export default RdiHeader
