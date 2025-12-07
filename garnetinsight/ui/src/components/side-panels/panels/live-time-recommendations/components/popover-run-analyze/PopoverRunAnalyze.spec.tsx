import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import PopoverRunAnalyze, { Props } from './PopoverRunAnalyze'

const mockedProps = mock<Props>()

describe('PopoverRunAnalyze', () => {
  it('should render', () => {
    expect(
      render(<PopoverRunAnalyze {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
