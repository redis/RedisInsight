import { cloneDeep } from 'lodash'
import React from 'react'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  screen,
} from 'uiSrc/utils/test-utils'
import EncryptionErrorContent from './EncryptionErrorContent'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('EncryptionErrorContent', () => {
  it('should render', () => {
    expect(render(<EncryptionErrorContent />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(<EncryptionErrorContent onClose={onClose} />)
    fireEvent.click(screen.getByTestId('toast-action-btn'))

    expect(onClose).toHaveBeenCalled()
  })
})
