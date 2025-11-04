import React from 'react'
import { useSelector } from 'react-redux'

import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const { data: instances } = useSelector(instancesSelector)

  return (
    <div className="containerDl">
      <Row className="contentDL" align="center" gap="s">
        {instances.length > 0 && (
          <>
            <FlexItem>
              <PrimaryButton
                onClick={onRdiInstanceClick}
                data-testid="rdi-instance"
              >
                <span>+ Endpoint</span>
              </PrimaryButton>
            </FlexItem>
            <FlexItem className="searchContainer">
              <SearchRdiList />
            </FlexItem>
          </>
        )}
      </Row>
      <Spacer className="spacerDl" />
    </div>
  )
}

export default RdiHeader
