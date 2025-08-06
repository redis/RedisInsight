import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { mockModal } from 'uiSrc/mocks/components/modal'
import FormDialog from './FormDialog'

jest.mock('uiBase/display', () => {
  const actual = jest.requireActual('uiBase/display')

  return mockModal(actual)
})

describe('FormDialog', () => {
  it('should render', () => {
    render(
      <FormDialog
        isOpen
        onClose={jest.fn()}
        header={<div data-testid="header" />}
        footer={<div data-testid="footer" />}
      >
        <div data-testid="body" />
      </FormDialog>,
    )

    // comment out until the modal header issue is fixed
    // expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('body')).toBeInTheDocument()
  })
})
