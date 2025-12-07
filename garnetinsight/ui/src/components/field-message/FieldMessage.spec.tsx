import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import FieldMessage, { Props } from './FieldMessage'

const mockedProps = mock<Props>()

describe('FieldMessage', () => {
  it('should render', () => {
    const message = 'Error Message'
    expect(
      render(<FieldMessage {...instance(mockedProps)}>{message}</FieldMessage>),
    ).toBeTruthy()
  })
})
