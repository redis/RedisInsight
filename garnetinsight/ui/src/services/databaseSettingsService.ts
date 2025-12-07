import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { DatabaseSettingsData } from 'uiSrc/slices/interfaces'

export const getDbSettingsUrl = (instanceId: String) =>
  `${ApiEndpoints.DATABASES}/${instanceId}/settings`

export const getDbSettings = async (instanceId: String) => {
  const url = getDbSettingsUrl(instanceId)
  const {
    data: { data },
    status,
  } = await apiService.get<{ data: DatabaseSettingsData }>(url)

  return { data, status }
}

export const updateDbSettings = async (
  instanceId: String,
  updateData: DatabaseSettingsData,
) => {
  const url = getDbSettingsUrl(instanceId)
  const {
    data: { data },
    status,
  } = await apiService.post<{
    data: DatabaseSettingsData
  }>(url, { data: updateData })

  return { data, status }
}
