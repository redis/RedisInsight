import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import QueryCardCliGroupResult, { Props } from './QueryCardCliGroupResult'

const mockedProps = mock<Props>()

describe('QueryCardCliGroupResult', () => {
  it('should render', () => {
    const mockResult = [
      {
        response: [
          {
            response: 'response',
            status: 'success',
          },
        ],
        status: 'success',
      },
    ]
    expect(
      render(
        <QueryCardCliGroupResult
          {...instance(mockedProps)}
          result={mockResult}
        />,
      ),
    ).toBeTruthy()
  })

  it('Should render result when result is undefined', () => {
    expect(
      render(<QueryCardCliGroupResult {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render error when command is psubscribe', () => {
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'psubscribe',
            response: 'response',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]
    const { container } = render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )
    const errorBtn = container.querySelector(
      '[data-test-subj="pubsub-page-btn"]',
    )

    expect(errorBtn).toBeInTheDocument()
  })

  it('should render (nil) when response is null', () => {
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'psubscribe',
            response: null,
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]
    const { container } = render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )
    const errorBtn = container.querySelector(
      '[data-test-subj="pubsub-page-btn"]',
    )

    expect(errorBtn).not.toBeInTheDocument()
    expect(screen.getByText('(nil)')).toBeInTheDocument()
  })
})
