import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import QueryCardCliDefaultResult, { Props } from './QueryCardCliDefaultResult'

const mockedProps = mock<Props>()

describe('QueryCardCliDefaultResult', () => {
  it('should render', () => {
    expect(
      render(<QueryCardCliDefaultResult {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
