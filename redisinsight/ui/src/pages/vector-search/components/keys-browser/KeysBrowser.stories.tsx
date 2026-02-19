import React, { useLayoutEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { Route, useHistory } from 'react-router-dom'
import { faker } from '@faker-js/faker'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Card, Spacer } from 'uiSrc/components/base/layout'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { KeyTypes } from 'uiSrc/constants'
import { loadKeysSuccess, setFilter } from 'uiSrc/slices/browser/keys'
import {
  setAppContextConnectedInstanceId,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { apiService } from 'uiSrc/services'

import KeysBrowser from './KeysBrowser'

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

const KeysBrowserContent = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const handleSelectKey = (key: RedisResponseBuffer) => {
    setSelectedKey(bufferToString(key))
  }

  return (
    <Col>
      <div style={{ width: 300, height: 500, border: '1px solid #ccc' }}>
        <KeysBrowser onSelectKey={handleSelectKey} />
      </div>

      <Spacer size="l" />
      <Card style={{ padding: '10px' }}>
        <Text size="s" color="secondary">
          Selected key: {selectedKey ?? '(none)'}
        </Text>
      </Card>
    </Col>
  )
}

const meta: Meta<typeof KeysBrowser> = {
  component: KeysBrowser,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    () => (
      <StorePopulator>
        <Route path="/:instanceId/vector-search">
          <KeysBrowserContent />
        </Route>
      </StorePopulator>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
