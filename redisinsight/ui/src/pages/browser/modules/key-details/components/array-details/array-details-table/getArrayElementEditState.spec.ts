import {
  KeyValueFormat,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { getConfig } from 'uiSrc/config'
import {
  RedisResponseBuffer,
  RedisResponseBufferType,
} from 'uiSrc/slices/interfaces'

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

  it('marks a value with non-printable bytes non-editable', () => {
    // 0xC0 is an invalid UTF-8 lead byte, so it doesn't round-trip through a
    // string and back — the definition of unprintable here.
    const unprintable = {
      type: RedisResponseBufferType.Buffer,
      data: [0xc0],
    } as RedisResponseBuffer
    const state = getArrayElementEditState(
      unprintable,
      null,
      KeyValueFormat.Unicode,
    )

    expect(state.isUnprintable).toBe(true)
    expect(state.isEditable).toBe(false)
    expect(state.editDisabledReason).toBe(TEXT_UNPRINTABLE_CHARACTERS.content)
  })
})
