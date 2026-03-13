import React from 'react'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { MakeSearchableButton } from './MakeSearchableButton'
import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

const mockOpenModal = jest.fn()

jest.mock('uiSrc/pages/browser/components/make-searchable-modal', () => ({
  useMakeSearchableModal: () => ({ openMakeSearchableModal: mockOpenModal }),
}))

const mockKeyBuffer = { type: 'Buffer', data: [116, 101, 115, 116] }

const defaultProps: MakeSearchableButtonProps = {
  keyName: mockKeyBuffer as any,
  keyNameString: 'bikes:10002',
  keyType: KeyTypes.Hash,
}

const renderComponent = (
  propsOverride?: Partial<MakeSearchableButtonProps>,
) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<MakeSearchableButton {...props} />)
}

describe('MakeSearchableButton', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render a primary button with "Make searchable" label', () => {
    renderComponent()

    const btn = screen.getByTestId('make-searchable-btn')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Make searchable')
  })

  it('should call openMakeSearchableModal with correct config on click', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('make-searchable-btn'))

    expect(mockOpenModal).toHaveBeenCalledWith({
      prefix: 'bikes:',
      initialKey: mockKeyBuffer,
      initialKeyType: RedisearchIndexKeyType.HASH,
      initialPrefix: 'bikes:',
    })
  })

  it('should map JSON key type to RedisearchIndexKeyType.JSON', async () => {
    renderComponent({ keyType: KeyTypes.ReJSON })

    await userEvent.click(screen.getByTestId('make-searchable-btn'))

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        initialKeyType: RedisearchIndexKeyType.JSON,
      }),
    )
  })
})
