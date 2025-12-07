import React from 'react'
import { mock } from 'ts-mockito'
import {
  render,
  screen,
  userEvent,
  waitForRedisUiSelectVisible,
} from 'uiSrc/utils/test-utils'

import { KeyDetailsHeaderFormatter, Props } from './KeyDetailsHeaderFormatter'

const mockedProps = {
  ...mock<Props>(),
}

describe('KeyValueFormatter', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderFormatter {...mockedProps} />)).toBeTruthy()
  })

  it('should render options in the strict order', async () => {
    const strictOrder = [
      'Unicode',
      'ASCII',
      'Binary',
      'HEX',
      'JSON',
      'Msgpack',
      'Pickle',
      'Protobuf',
      'PHP serialized',
      'Java serialized',
      'Vector 32-bit',
      'Vector 64-bit',
    ]
    render(<KeyDetailsHeaderFormatter {...mockedProps} />)

    await userEvent.click(screen.getByTestId('select-format-key-value'))

    await waitForRedisUiSelectVisible()
    strictOrder.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
  })
})
