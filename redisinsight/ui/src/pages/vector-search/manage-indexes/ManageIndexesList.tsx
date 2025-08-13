import { Loader } from '@redis-ui/components'
import React from 'react'

import { bufferToString } from 'uiSrc/utils'
import { StyledManageIndexesListAction } from './ManageIndexesList.styles'
import { IndexSection } from './IndexSection'
import { useRedisearchListData } from '../useRedisearchListData'

export const ManageIndexesList = () => {
  const { data, loading } = useRedisearchListData()

  return (
    <StyledManageIndexesListAction data-testid="manage-indexes-list">
      {loading && <Loader data-testid="manage-indexes-list--loader" />}

      {data.map((index) => (
        <IndexSection index={index} key={`index-${bufferToString(index)}`} />
      ))}
    </StyledManageIndexesListAction>
  )
}
