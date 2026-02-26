import { useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import { SeedQueryLibraryItem } from 'uiSrc/services/query-library/types'

import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { EditorTab } from '../../components/query-editor/QueryEditor.types'
import { createIndexNotifications } from '../../constants'
import { useCreateIndex } from '../useCreateIndex'
import { useRedisearchListData } from '../useRedisearchListData'
import {
  getIndexNameBySampleData,
  getSampleQueriesBySampleData,
} from '../../utils/sampleData'

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
  const queryLibraryService = useRef(new QueryLibraryService()).current

  const seedSampleQueries = useCallback(
    async (
      instanceId: string,
      indexName: string,
      dataset: SampleDataContent,
    ) => {
      const seedItems: SeedQueryLibraryItem[] = getSampleQueriesBySampleData(
        dataset,
      ).map((sq) => ({
        indexName,
        name: sq.name,
        description: sq.description,
        query: sq.query,
      }))

      await queryLibraryService.seed(instanceId, seedItems)
    },
    [queryLibraryService],
  )

  const navigateToLibrary = useCallback(
    (instanceId: string, indexName: string) => {
      history.push({
        pathname: Pages.vectorSearchQuery(instanceId, indexName),
        state: { activeTab: EditorTab.Library },
      })
    },
    [history],
  )

  const run = useCallback(
    async (instanceId: string, dataset: SampleDataContent) => {
      const indexName = getIndexNameBySampleData(dataset)
      const indexAlreadyExists = existingIndexes.includes(indexName)

      if (indexAlreadyExists) {
        dispatch(
          addMessageNotification(
            createIndexNotifications.sampleDataAlreadyExists(),
          ),
        )
        await seedSampleQueries(instanceId, indexName, dataset)
        navigateToLibrary(instanceId, indexName)
        return
      }

      createIndex(
        { instanceId, indexName, dataContent: dataset },
        async () => {
          dispatch(
            addMessageNotification(
              createIndexNotifications.sampleDataCreated(),
            ),
          )
          dispatch(fetchRedisearchListAction())
          await seedSampleQueries(instanceId, indexName, dataset)
          navigateToLibrary(instanceId, indexName)
        },
        async () => {
          dispatch(
            addMessageNotification(createIndexNotifications.createFailed()),
          )
        },
      )
    },
    [
      existingIndexes,
      createIndex,
      dispatch,
      seedSampleQueries,
      navigateToLibrary,
    ],
  )

  return { run, loading }
}
