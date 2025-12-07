import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import ConnectionFormWrapper, { Props } from './ConnectionFormWrapper'

const mockedProps = mock<Props>()

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

describe('ConnectionFormWrapper', () => {
  it('should render', () => {
    expect(render(<ConnectionFormWrapper {...mockedProps} />)).toBeTruthy()
  })

  it('should not render form with isOpen = false', () => {
    render(<ConnectionFormWrapper {...mockedProps} isOpen={false} />)

    expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument()
  })

  it('should render form with isOpen = true', () => {
    render(<ConnectionFormWrapper {...mockedProps} isOpen />)

    expect(screen.getByTestId('connection-form')).toBeInTheDocument()
  })
})
