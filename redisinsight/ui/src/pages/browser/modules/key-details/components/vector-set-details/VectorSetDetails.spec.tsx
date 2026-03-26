import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Props, VectorSetDetails } from './VectorSetDetails'

const mockedProps = mock<Props>()

describe('VectorSetDetails', () => {
  it('should render key details header', () => {
    render(<VectorSetDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('key-details-header')).toBeInTheDocument()
  })

  it('should render subheader with format selector', () => {
    render(<VectorSetDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })
})
