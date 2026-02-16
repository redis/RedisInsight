import { AxiosResponse } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto/index.info.dto'

import { transformIndexInfo } from '../useIndexInfo/useIndexInfo.utils'
import { IndexInfo } from '../useIndexInfo/useIndexInfo.types'
import { IndexListRow } from '../../components/index-list/IndexList.types'

/**
 * Fetches index info for all given index names in parallel.
 */
export const fetchAllIndexesInfo = (
  instanceId: string,
  indexNames: string[],
): Promise<PromiseSettledResult<AxiosResponse<IndexInfoDto>>[]> =>
  Promise.allSettled(
    indexNames.map((name) =>
      apiService.post<IndexInfoDto>(
        getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO),
        { index: name },
      ),
    ),
  )

/**
 * Maps settled API results to IndexListRow[], skipping failed requests.
 */
export const transformIndexListRows = (
  indexNames: string[],
  results: PromiseSettledResult<AxiosResponse<IndexInfoDto>>[],
): IndexListRow[] =>
  results.reduce<IndexListRow[]>((rows, result, i) => {
    if (
      result.status === 'fulfilled' &&
      isStatusSuccessful(result.value.status)
    ) {
      rows.push(
        transformIndexListRow(
          indexNames[i],
          transformIndexInfo(result.value.data),
        ),
      )
    }
    return rows
  }, [])

/**
 * Converts an IndexInfo into an IndexListRow for the list table.
 */
export const transformIndexListRow = (
  name: string,
  info: IndexInfo,
): IndexListRow => ({
  id: name,
  name,
  prefixes: info.indexDefinition.prefixes,
  fieldTypes: [...new Set(info.attributes.map((attr) => attr.type))],
  numDocs: info.numDocs,
  numRecords: info.numRecords,
  numTerms: info.numTerms,
  numFields: info.attributes.length,
})
