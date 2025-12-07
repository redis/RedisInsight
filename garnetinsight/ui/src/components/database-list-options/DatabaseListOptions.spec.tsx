import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import DatabaseListOptions from './DatabaseListOptions'

const optionsMock: Partial<any> = {
  enabledDataPersistence: true,
  persistencePolicy: 'aof-every-write',
  enabledRedisFlash: false,
  enabledReplication: false,
  enabledBackup: false,
  enabledActiveActive: false,
  enabledClustering: false,
  isReplicaDestination: false,
  isReplicaSource: false,
}

describe('DatabaseListOptions', () => {
  it('should render', () => {
    expect(render(<DatabaseListOptions options={optionsMock} />)).toBeTruthy()
  })
})
