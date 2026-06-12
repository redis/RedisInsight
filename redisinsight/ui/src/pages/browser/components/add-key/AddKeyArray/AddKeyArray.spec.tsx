import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import AddKeyArray, { Props } from './AddKeyArray'

const mockedProps = mock<Props>()

describe('AddKeyArray', () => {
  beforeEach(() => {
    // ActionFooter renders via a portal to #formFooterBar
    const footer = document.createElement('div')
    footer.setAttribute('id', 'formFooterBar')
    document.body.appendChild(footer)
  })

  afterEach(() => {
    document.getElementById('formFooterBar')?.remove()
  })

  it('should render', () => {
    expect(render(<AddKeyArray {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should keep the submit button disabled', () => {
    render(<AddKeyArray {...instance(mockedProps)} keyName="name" />)

    expect(screen.getByTestId('add-key-array-btn')).toBeDisabled()
  })
})
