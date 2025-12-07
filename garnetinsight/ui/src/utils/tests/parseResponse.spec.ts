import { omit } from 'lodash'
import { parseKeysListResponse } from 'uiSrc/utils'

const nextCursor = '127.0.0.1:7000@100||127.0.0.1:7002@9'

describe('parseKeysListResponse', () => {
  it('should handle empty array in response', () => {
    const currentState = {
      total: 0,
      scanned: 0,
      nextCursor: '0',
      keys: [],
      shardsMeta: {},
    }
    const scanResponse = []
    expect(
      parseKeysListResponse(currentState.shardsMeta, scanResponse),
    ).toEqual(currentState)
  })
  it('should summarize data with initial state (standalone)', () => {
    const currentState = {
      nextCursor: '0',
      total: 0,
      scanned: 0,
      shardsMeta: {},
    }
    const scanResponse = [
      {
        cursor: 100,
        total: 200,
        scanned: 150,
        keys: ['keywithdetails'],
      },
    ]
    const result = parseKeysListResponse(currentState.shardsMeta, scanResponse)
    expect(result).toEqual({
      ...omit(scanResponse[0], 'cursor'),
      nextCursor: `${scanResponse[0].cursor}`,
      shardsMeta: {
        standalone: omit(scanResponse[0], 'keys'),
      },
    })
  })
  it('should summarize data with existing one (standalone)', () => {
    const currentState = {
      nextCursor: '100',
      total: 200,
      scanned: 150,
      shardsMeta: {
        standalone: {
          cursor: 100,
          total: 200,
          scanned: 150,
        },
      },
    }
    const scanResponse = [
      {
        cursor: 0,
        total: 201,
        scanned: 150,
        keys: ['keywithdetails'],
      },
    ]
    const result = parseKeysListResponse(currentState.shardsMeta, scanResponse)
    expect(result).toEqual({
      ...omit(scanResponse[0], 'cursor'),
      scanned: scanResponse[0].total,
      nextCursor: `${scanResponse[0].cursor}`,
      shardsMeta: {
        standalone: {
          ...omit(scanResponse[0], 'keys'),
          scanned: scanResponse[0].total,
        },
      },
    })
  })
  it('should summarize data  with initial state (cluster)', () => {
    const currentState = {
      nextCursor,
      total: 200 + 50 + 400,
      scanned: 150 + 50 + 150,
      shardsMeta: {},
    }
    const scanResponse = [
      {
        cursor: 100,
        total: 200,
        scanned: 150,
        keys: ['shard1_key'],
        host: '127.0.0.1',
        port: 7000,
      },
      {
        cursor: 0,
        total: 50,
        scanned: 150,
        keys: [],
        host: '127.0.0.1',
        port: 7001,
      },
      {
        cursor: 9,
        total: 400,
        scanned: 150,
        keys: ['shard3_key'],
        host: '127.0.0.1',
        port: 7002,
      },
    ]
    const result = parseKeysListResponse(currentState.shardsMeta, scanResponse)
    expect(result).toEqual({
      nextCursor,
      total: 200 + 50 + 400,
      scanned: 150 + 50 + 150,
      keys: ['shard1_key', 'shard3_key'],
      shardsMeta: {
        '127.0.0.1:7000': {
          cursor: 100,
          total: 200,
          scanned: 150,
          host: '127.0.0.1',
          port: 7000,
        },
        '127.0.0.1:7001': {
          cursor: 0,
          total: 50,
          scanned: 50,
          host: '127.0.0.1',
          port: 7001,
        },
        '127.0.0.1:7002': {
          cursor: 9,
          total: 400,
          scanned: 150,
          host: '127.0.0.1',
          port: 7002,
        },
      },
    })
  })
  it('should summarize data  with initial one (cluster)', () => {
    const currentState = {
      nextCursor: '127.0.0.1:7000@100||127.0.0.1:7002@9',
      total: 200 + 50 + 400,
      scanned: 150 + 50 + 150,
      keys: ['shard1_key', 'shard3_key'],
      shardsMeta: {
        '127.0.0.1:7000': {
          cursor: 100,
          total: 200,
          scanned: 150,
          host: '127.0.0.1',
          port: 7000,
        },
        '127.0.0.1:7001': {
          cursor: 0,
          total: 50,
          scanned: 50,
          host: '127.0.0.1',
          port: 7001,
        },
        '127.0.0.1:7002': {
          cursor: 9,
          total: 400,
          scanned: 150,
          host: '127.0.0.1',
          port: 7002,
        },
      },
    }
    const scanResponse = [
      {
        cursor: 0,
        total: 201,
        scanned: 150,
        keys: ['new_shard1_key'],
        host: '127.0.0.1',
        port: 7000,
      },
      {
        cursor: 18,
        total: 400,
        scanned: 150,
        keys: ['new_shard3_key'],
        host: '127.0.0.1',
        port: 7002,
      },
    ]
    const result = parseKeysListResponse(currentState.shardsMeta, scanResponse)
    expect(result).toEqual({
      nextCursor: '127.0.0.1:7002@18',
      total: 201 + 50 + 400,
      scanned: 201 + 50 + 300,
      keys: ['new_shard1_key', 'new_shard3_key'],
      shardsMeta: {
        '127.0.0.1:7000': {
          cursor: 0,
          total: 201,
          scanned: 201,
          host: '127.0.0.1',
          port: 7000,
        },
        '127.0.0.1:7001': {
          cursor: 0,
          total: 50,
          scanned: 50,
          host: '127.0.0.1',
          port: 7001,
        },
        '127.0.0.1:7002': {
          cursor: 18,
          total: 400,
          scanned: 300,
          host: '127.0.0.1',
          port: 7002,
        },
      },
    })
  })
})
