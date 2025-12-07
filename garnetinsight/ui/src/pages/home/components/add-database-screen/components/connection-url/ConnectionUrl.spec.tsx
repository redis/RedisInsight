import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import ConnectionUrl from './ConnectionUrl'

describe('ConnectionUrl', () => {
  it('should render', () => {
    expect(render(<ConnectionUrl value="" onChange={() => {}} />)).toBeTruthy()
  })

  it('should change connection url', () => {
    const onChangeMock = jest.fn()
    render(<ConnectionUrl value="val" onChange={onChangeMock} />)

    expect(screen.getByTestId('connection-url')).toHaveValue('val')

    fireEvent.change(screen.getByTestId('connection-url'), {
      target: { value: 'val1' },
    })

    expect(onChangeMock).toBeCalled()
  })
})
