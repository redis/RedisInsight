import {
  KeyValueFormat,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
} from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { getConfig } from 'uiSrc/config'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getArrayElementEditState } from './getArrayElementEditState'

const { truncatedStringPrefix } = getConfig().app

const buffer = (s: string) => stringToBuffer(s) as RedisResponseBuffer

describe('getArrayElementEditState', () => {
  it('marks a plain unicode value editable with no disabled reason', () => {
    const state = getArrayElementEditState(
      buffer('hello'),
      null,
      KeyValueFormat.Unicode,
    )

    expect(state.isEditable).toBe(true)
    expect(state.isTruncated).toBe(false)
    expect(state.editDisabledReason).toBeNull()
    expect(state.serialize()).toBe('hello')
  })

  it('marks a backend-truncated value non-editable with the truncated reason', () => {
    const state = getArrayElementEditState(
      buffer(`${truncatedStringPrefix} big value`),
      null,
      KeyValueFormat.Unicode,
    )

    expect(state.isTruncated).toBe(true)
    expect(state.isEditable).toBe(false)
    expect(state.editDisabledReason).toBe(
      TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
    )
  })
})
