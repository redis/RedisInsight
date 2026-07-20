import React from 'react'
import { apiService } from 'uiSrc/services'
import { render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { mockArrayKeyBuffer } from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import { NeighbourBand } from './NeighbourBand'
import { NeighbourBandProps } from './NeighbourBand.types'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

const keyBuffer = mockArrayKeyBuffer

const defaultProps: NeighbourBandProps = {
  keyProp: keyBuffer,
  matchIndex: '41',
  count: 1,
}

const renderBand = (propsOverride?: Partial<NeighbourBandProps>) =>
  render(<NeighbourBand {...defaultProps} {...propsOverride} />)

const mockRange = (elements: (string | null)[]) => {
  apiService.post = jest.fn().mockResolvedValue({
    status: 200,
    data: { keyName: keyBuffer, elements },
  })
}

describe('NeighbourBand', () => {
  it('fetches and renders the ±count neighbours, highlighting the match', async () => {
    mockRange(['v40', 'v41', 'v42'])
    renderBand({ matchIndex: '41', count: 1 })

    await waitFor(() =>
      expect(screen.getByTestId('array-context-band-41')).toBeInTheDocument(),
    )
    expect(
      screen.getByTestId('array-context-band-match-41'),
    ).toBeInTheDocument()
  })

  it('requests a non-negative start when the match is near index 0', async () => {
    mockRange(['v0', 'v1', 'v2'])
    renderBand({ matchIndex: '2', count: 5 })

    // Wait for the settled band so the trailing state update is flushed.
    await screen.findByTestId('array-context-band-2')
    const [, body] = (apiService.post as jest.Mock).mock.calls[0]
    expect(body.start).toBe('0')
  })

  it('shows an inline error when the fetch fails', async () => {
    apiService.post = jest.fn().mockResolvedValue({ status: 500, data: null })
    renderBand({ matchIndex: '41', count: 1 })

    await waitFor(() =>
      expect(
        screen.getByTestId('array-context-band-error-41'),
      ).toBeInTheDocument(),
    )
  })

  it('refetches with a wider range when count grows', async () => {
    mockRange(['v40', 'v41', 'v42'])
    const { rerender } = renderBand({ matchIndex: '41', count: 1 })
    // Let the first fetch settle into the DOM before widening the window.
    await screen.findByTestId('array-context-band-row-40')
    expect(apiService.post).toHaveBeenCalledTimes(1)

    mockRange(['v38', 'v39', 'v40', 'v41', 'v42', 'v43', 'v44'])
    rerender(<NeighbourBand {...defaultProps} matchIndex="41" count={3} />)

    // The wider range's outermost neighbour confirms the refetch landed.
    await screen.findByTestId('array-context-band-row-38')
    const last = (apiService.post as jest.Mock).mock.calls.at(-1)
    expect(last?.[1]).toEqual({
      keyName: keyBuffer,
      start: '38',
      end: '44',
    })
  })
})
