import React from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const VectorSetDetails = (props: Props) => {
  const keyType = KeyTypes.VectorSet

  const { loading } = useSelector(selectedKeySelector)

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <p>Vector Set details table will be implemented here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { VectorSetDetails }
