import { Loader } from '@redis-ui/components'
import React from 'react'

import { bufferToString } from 'uiSrc/utils'
import { StyledManageIndexesListAction } from './ManageIndexesList.styles'
import { IndexSection } from './IndexSection'
import { useRedisearchListData } from '../useRedisearchListData'
import NoIndexesMessage from './NoIndexesMessage'

export const ManageIndexesList = () => {
  const { data, loading } = useRedisearchListData()
  const hasIndexes = !!data?.length

  return (
    <StyledManageIndexesListAction data-testid="manage-indexes-list">
      {loading && <Loader data-testid="manage-indexes-list--loader" />}

      {!loading && !hasIndexes && <NoIndexesMessage />}

      {data.map((index) => (
        <IndexSection index={index} key={`index-${bufferToString(index)}`} />
      ))}
    </StyledManageIndexesListAction>
  )
}
