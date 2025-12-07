import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import KeyboardShortcut, { Props } from './KeyboardShortcut'

const mockedProps = mock<Props>()

describe('KeyboardShortcut', () => {
  it('should render', () => {
    expect(render(<KeyboardShortcut {...instance(mockedProps)} />)).toBeTruthy()
  })
})
