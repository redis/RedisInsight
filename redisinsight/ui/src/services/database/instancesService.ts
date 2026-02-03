import { RedisNodeInfoResponse } from 'src/modules/database/dto/redis-info.dto'
import { Database as DatabaseInstanceResponse } from 'src/modules/database/models/database'
import { ExportDatabase } from 'src/modules/database/models/export-database'
import axios, { CancelTokenSource } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { Instance } from 'uiSrc/slices/interfaces'
import { PartialInstance } from 'uiSrc/slices/instances/instances'

const endpoint = ApiEndpoints.DATABASES

export async function getInstanceInfo(id: string) {
  const { data, status } = await apiService.get<RedisNodeInfoResponse>(
    `${endpoint}/${id}/info`,
  )
  return isStatusSuccessful(status) ? data : null
}
export async function getInstanceOverview(id: string) {
  const { data, status } = await apiService.get<RedisNodeInfoResponse>(
    `${endpoint}/${id}/overview`,
  )

  return isStatusSuccessful(status) ? data : null
}

export const sourceInstance: {
  source: Nullable<CancelTokenSource>
} = {
  source: null,
}

export async function updateInstanceAlias(id: string, name: string) {
  sourceInstance.source?.cancel?.()
  const { CancelToken } = axios
  sourceInstance.source = CancelToken.source()

  const { status } = await apiService.patch(
    `${endpoint}/${id}`,
    { name },
    { cancelToken: sourceInstance.source.token },
  )

  sourceInstance.source = null

  return isStatusSuccessful(status)
}

export async function checkInstanceDbIndex(id: string, index: number) {
  const { status } = await apiService.get(`${endpoint}/${id}/db/${index}`)

  return isStatusSuccessful(status)
}

export async function importInstances(importData: FormData) {
  const { status, data } = await apiService.post(
    ApiEndpoints.DATABASES_IMPORT,
    importData,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return isStatusSuccessful(status) ? data : null
}

export async function testInstanceConnection(
  id?: string,
  payload?: PartialInstance,
) {
  const url = id
    ? `${ApiEndpoints.DATABASES_TEST_CONNECTION}/${id}`
    : `${ApiEndpoints.DATABASES_TEST_CONNECTION}`
  const { status } = await apiService.post(url, payload)

  return isStatusSuccessful(status)
}

export async function getInstance(id: string) {
  const { data, status } = await apiService.get<Instance>(`${endpoint}/${id}`)

  return isStatusSuccessful(status) ? data : null
}

export async function connectInstance(id: string) {
  const { status } = await apiService.get(`${endpoint}/${id}/connect`)

  return isStatusSuccessful(status)
}

export async function listDatabases() {
  const { data, status } =
    await apiService.get<DatabaseInstanceResponse[]>(endpoint)

  return isStatusSuccessful(status) ? data : null
}

export async function createInstance(instance: Partial<Instance>) {
  const { data, status } = await apiService.post(endpoint, instance)

  return isStatusSuccessful(status) ? data : null
}

export async function updateInstance(
  id: string,
  instance: Partial<Instance> | PartialInstance,
) {
  const { status } = await apiService.patch(`${endpoint}/${id}`, instance)

  return isStatusSuccessful(status)
}

export async function cloneInstance(id: string, instance: Partial<Instance>) {
  const { status, data } = await apiService.post(
    `${endpoint}/clone/${id}`,
    instance,
  )

  return isStatusSuccessful(status) ? data : null
}

export async function deleteInstances(databasesIds: string[]) {
  const { status } = await apiService.delete(endpoint, {
    data: { ids: databasesIds },
  })
  return isStatusSuccessful(status)
}

export async function exportInstances(ids: string[], withSecrets: boolean) {
  const { data, status } = await apiService.post<ExportDatabase>(
    ApiEndpoints.DATABASES_EXPORT,
    {
      ids,
      withSecrets,
    },
  )
  return isStatusSuccessful(status) ? data : null
}
