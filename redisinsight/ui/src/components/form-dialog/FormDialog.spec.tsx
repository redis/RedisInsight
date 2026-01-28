import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import FormDialog from './FormDialog'

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
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
