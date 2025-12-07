import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import StreamDataViewWrapper, { Props } from './StreamDataViewWrapper'

const mockedProps = mock<Props>()

describe('StreamDataViewWrapper', () => {
  it('should render', () => {
    expect(
      render(<StreamDataViewWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render Stream Data container', () => {
    render(<StreamDataViewWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('stream-entries-container')).toBeInTheDocument()
  })
})
