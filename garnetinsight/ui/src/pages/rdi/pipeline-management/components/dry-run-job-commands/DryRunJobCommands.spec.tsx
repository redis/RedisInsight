import React from 'react'
import { act, render, screen } from 'uiSrc/utils/test-utils'

import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import DryRunJobCommands from './DryRunJobCommands'

jest.mock('uiSrc/slices/rdi/dryRun', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/dryRun'),
  rdiDryRunJobSelector: jest.fn().mockReturnValue({
    results: null,
  }),
}))

describe('DryRunJobCommands', () => {
  it('should render', () => {
    expect(render(<DryRunJobCommands />)).toBeTruthy()
  })

  it('should render no commands message', async () => {
    const rdiDryRunJobSelectorMock = jest.fn().mockReturnValue({
      results: { output: {} },
    })
    ;(rdiDryRunJobSelector as jest.Mock).mockImplementationOnce(
      rdiDryRunJobSelectorMock,
    )

    await act(async () => {
      render(<DryRunJobCommands />)
    })

    expect(screen.getByTestId('commands-output')).toHaveTextContent(
      'No Redis commands provided by the server.',
    )
  })

  it('should render no commands message if there is no commands', async () => {
    const rdiDryRunJobSelectorMock = jest.fn().mockReturnValue({
      results: {
        output: [{ name: 1 }],
      },
    })
    ;(rdiDryRunJobSelector as jest.Mock).mockImplementationOnce(
      rdiDryRunJobSelectorMock,
    )

    await act(async () => {
      render(<DryRunJobCommands />)
    })

    expect(screen.getByTestId('commands-output')).toHaveTextContent(
      'No Redis commands provided by the server.',
    )
  })

  it('should render transformations', async () => {
    const rdiDryRunJobSelectorMock = jest.fn().mockReturnValue({
      results: {
        output: [
          {
            connection: 'target',
            commands: [
              'HSET person:Yossi:Shirizli FNAME Yossi LAST_NAME Shirizli COUNTRY IL',
            ],
          },
        ],
      },
    })
    ;(rdiDryRunJobSelector as jest.Mock).mockImplementationOnce(
      rdiDryRunJobSelectorMock,
    )

    await act(async () => {
      render(<DryRunJobCommands target="target" />)
    })
    expect(screen.getByTestId('commands-output')).toHaveTextContent(
      'HSET person:Yossi:Shirizli FNAME Yossi LAST_NAME Shirizli COUNTRY IL',
    )
  })
})
