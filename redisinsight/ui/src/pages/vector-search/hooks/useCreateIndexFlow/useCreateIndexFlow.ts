import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'

import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { createIndexNotifications } from '../../constants'
import { useCreateIndex } from '../useCreateIndex'
import { useRedisearchListData } from '../useRedisearchListData'
import { getIndexNameBySampleData } from '../../utils/sampleData'

export interface UseCreateIndexFlowResult {
  /** Trigger index creation; navigates to query page on completion. */
  run: (instanceId: string, dataset: SampleDataContent) => void
  loading: boolean
}

/**
 * Shared hook that encapsulates the "create-index-or-navigate-if-exists"
 * flow used by both VectorSearchContext (modal "Start querying") and
 * CreateIndexPageContext ("Create index" button).
 */
export const useCreateIndexFlow = (): UseCreateIndexFlowResult => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { run: createIndex, loading } = useCreateIndex()
  const { stringData: existingIndexes } = useRedisearchListData()

  const run = useCallback(
    (instanceId: string, dataset: SampleDataContent) => {
      const indexName = getIndexNameBySampleData(dataset)
      const indexAlreadyExists = existingIndexes.includes(indexName)

      if (indexAlreadyExists) {
        dispatch(
          addMessageNotification(
            createIndexNotifications.sampleDataAlreadyExists(),
          ),
        )
        history.push(Pages.vectorSearchQuery(instanceId, indexName))
        return
      }

      createIndex(
        { instanceId, indexName, dataContent: dataset },
        () => {
          dispatch(
            addMessageNotification(
              createIndexNotifications.sampleDataCreated(),
            ),
          )
          dispatch(fetchRedisearchListAction())
          history.push(Pages.vectorSearchQuery(instanceId, indexName))
        },
        () => {
          dispatch(
            addMessageNotification(createIndexNotifications.createFailed()),
          )
        },
      )
    },
    [existingIndexes, createIndex, dispatch, history],
  )

  return { run, loading }
}
