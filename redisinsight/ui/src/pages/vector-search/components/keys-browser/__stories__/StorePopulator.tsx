import React, { useLayoutEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { faker } from '@faker-js/faker'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { loadKeysSuccess, setFilter } from 'uiSrc/slices/browser/keys'
import {
  setAppContextConnectedInstanceId,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { apiService } from 'uiSrc/services'

const MOCK_INSTANCE_ID = faker.string.uuid()

const generateMockKeys = (count: number, type: KeyTypes) =>
  Array.from({ length: count }, (_, i) => {
    const name = `${type}:${faker.word.noun()}:${i}`
    return {
      nameString: name,
      name: stringToBuffer(name),
      type,
      ttl: faker.helpers.arrayElement([
        -1,
        faker.number.int({ min: 60, max: 86400 }),
      ]),
      size: faker.number.int({ min: 32, max: 8192 }),
      length: faker.number.int({ min: 1, max: 500 }),
    }
  })

const MOCK_KEYS_BY_TYPE: Record<string, ReturnType<typeof generateMockKeys>> = {
  [KeyTypes.Hash]: generateMockKeys(25, KeyTypes.Hash),
  [KeyTypes.ReJSON]: generateMockKeys(15, KeyTypes.ReJSON),
}

const buildMockKeysResponse = (keys: ReturnType<typeof generateMockKeys>) => ({
  data: [
    {
      cursor: 0,
      total: keys.length,
      scanned: keys.length,
      keys,
    },
  ],
  status: 200,
})

export const StorePopulator = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const interceptorId = apiService.interceptors.response.use(
      undefined,
      (error) => {
        const url = error?.config?.url ?? ''

        if (url.includes('/get-metadata')) {
          const body = JSON.parse(error.config?.data ?? '{}')
          const requestedKeys = body.keys || []
          const keyType = body.type || KeyTypes.Hash
          const responseData = requestedKeys.map((nameObj: any) => {
            const bufferData = nameObj?.data ?? {}
            const dataArray = Array.isArray(bufferData)
              ? bufferData
              : Object.keys(bufferData)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((k) => bufferData[k])
            return {
              name: { type: 'Buffer', data: dataArray },
              type: keyType,
              ttl: faker.helpers.arrayElement([
                -1,
                faker.number.int({ min: 60, max: 86400 }),
              ]),
              size: faker.number.int({ min: 32, max: 8192 }),
            }
          })
          return Promise.resolve({ data: responseData, status: 200 })
        }

        if (url.includes('/keys')) {
          const body = JSON.parse(error.config?.data ?? '{}')
          const keys =
            MOCK_KEYS_BY_TYPE[body.type] ?? MOCK_KEYS_BY_TYPE[KeyTypes.Hash]
          return Promise.resolve(buildMockKeysResponse(keys))
        }

        return Promise.reject(error)
      },
    )

    const hashKeys = MOCK_KEYS_BY_TYPE[KeyTypes.Hash]

    dispatch(setConnectedInstanceId(MOCK_INSTANCE_ID))
    dispatch(setAppContextConnectedInstanceId(MOCK_INSTANCE_ID))
    dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true))
    dispatch(setFilter(KeyTypes.Hash))
    dispatch(
      loadKeysSuccess({
        data: {
          total: hashKeys.length,
          scanned: hashKeys.length,
          nextCursor: '0',
          keys: hashKeys,
          shardsMeta: {},
        },
        isSearched: false,
        isFiltered: true,
      }),
    )

    history.push(`/${MOCK_INSTANCE_ID}/vector-search`)
    setReady(true)

    return () => {
      apiService.interceptors.response.eject(interceptorId)
    }
  }, [])

  if (!ready) return null
  return <>{children}</>
}
