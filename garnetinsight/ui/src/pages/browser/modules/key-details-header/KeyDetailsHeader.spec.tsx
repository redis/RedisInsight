import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { deleteSelectedKey } from 'uiSrc/slices/browser/keys'
import { KeyDetailsHeaderProps, KeyDetailsHeader } from './KeyDetailsHeader'

const mockedProps = mock<KeyDetailsHeaderProps>()

const KEY_INPUT_TEST_ID = 'edit-key-input'
const KEY_BTN_TEST_ID = 'edit-key-btn'
const TTL_INPUT_TEST_ID = 'edit-ttl-input'
const DELETE_KEY_BTN_TEST_ID = 'delete-key-btn'
const DELETE_KEY_CONFIRM_BTN_TEST_ID = 'delete-key-confirm-btn'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/browser/string', () => ({
  ...jest.requireActual('uiSrc/slices/browser/string'),
  stringDataSelector: jest.fn().mockReturnValue({
    value: {
      type: 'Buffer',
      data: [49, 50, 51, 52],
    },
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn().mockReturnValue({
    name: {
      type: 'Buffer',
      data: [116, 101, 115, 116],
    },
    nameString: 'test',
    length: 4,
  }),
}))

describe('KeyDetailsHeader', () => {
  global.navigator.clipboard = {
    writeText: jest.fn(),
  }

  it('should render', () => {
    expect(render(<KeyDetailsHeader {...mockedProps} />)).toBeTruthy()
  })

  it('should change key properly', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.click(screen.getByTestId(KEY_BTN_TEST_ID))

    fireEvent.change(screen.getByTestId(KEY_INPUT_TEST_ID), {
      target: { value: 'key' },
    })
    expect(screen.getByTestId(KEY_INPUT_TEST_ID)).toHaveValue('key')
  })

  it('should be able to copy key', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.focus(screen.getByTestId(KEY_BTN_TEST_ID))

    fireEvent.mouseEnter(screen.getByTestId(KEY_BTN_TEST_ID))

    expect(screen.getByLabelText(/Copy key name/i)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Copy key name/i))
  })

  it('should change ttl properly', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.click(screen.getByTestId('edit-ttl-btn'))

    fireEvent.change(screen.getByTestId(TTL_INPUT_TEST_ID), {
      target: { value: '100' },
    })

    expect(screen.getByTestId(TTL_INPUT_TEST_ID)).toHaveValue('100')
  })

  describe('should call onRefresh', () => {
    test.each(Object.values(KeyTypes))(
      'should call onRefresh for keyType: %s',
      (keyType) => {
        const component = render(
          <KeyDetailsHeader {...mockedProps} keyType={keyType} />,
        )
        fireEvent.click(screen.getByTestId('key-refresh-btn'))
        expect(component).toBeTruthy()
      },
    )
  })

  describe('should call onDelete', () => {
    test.each(Object.values(KeyTypes))(
      'should call onDelete for keyType: %s',
      (keyType) => {
        const onRemoveKeyMock = jest.fn()
        const component = render(
          <KeyDetailsHeader
            {...mockedProps}
            keyType={keyType}
            onRemoveKey={onRemoveKeyMock}
          />,
        )
        fireEvent.click(screen.getByTestId(DELETE_KEY_BTN_TEST_ID))
        fireEvent.click(screen.getByTestId(DELETE_KEY_CONFIRM_BTN_TEST_ID))
        expect(component).toBeTruthy()

        const expectedActions = [deleteSelectedKey()]
        expect(store.getActions()).toEqual(
          expect.arrayContaining(expectedActions),
        )
      },
    )
  })
})
