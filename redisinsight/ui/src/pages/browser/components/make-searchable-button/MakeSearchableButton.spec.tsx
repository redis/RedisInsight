import React from 'react'
import reactRouterDom from 'react-router-dom'
import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  userEvent,
  cleanup,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { KeyTypes, Pages } from 'uiSrc/constants'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { CreateIndexMode } from 'uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import { MakeSearchableModalProvider } from 'uiSrc/pages/browser/components/make-searchable-modal'

import { MakeSearchableButton } from './MakeSearchableButton'
import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

const mockPush = jest.fn()
const mockInstanceId = faker.string.uuid()
const mockKeyBuffer = { type: 'Buffer', data: [116, 101, 115, 116] }

const defaultProps: MakeSearchableButtonProps = {
  keyName: mockKeyBuffer as any,
  keyNameString: 'bikes:10002',
  keyType: KeyTypes.Hash,
}

let store: typeof mockedStore
beforeEach(() => {
  store = cloneDeep(mockedStore)
  store.clearActions()
  const state = store.getState()
  state.connections.instances.connectedInstance.id = mockInstanceId
})

const renderComponent = (
  propsOverride?: Partial<MakeSearchableButtonProps>,
) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(
    <MakeSearchableModalProvider>
      <MakeSearchableButton {...props} />
    </MakeSearchableModalProvider>,
    { store },
  )
}

describe('MakeSearchableButton', () => {
  beforeEach(() => {
    cleanup()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
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

  it('should open modal on click', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('make-searchable-btn'))

    expect(screen.getByTestId('make-searchable-modal-body')).toBeInTheDocument()
  })

  it('should navigate to create index page with correct query params on confirm', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('make-searchable-btn'))
    await userEvent.click(screen.getByTestId('make-searchable-modal-confirm'))

    expect(mockPush).toHaveBeenCalledWith({
      pathname: Pages.vectorSearchCreateIndex(mockInstanceId),
      search:
        `mode=${CreateIndexMode.ExistingData}&initialKey=test` +
        `&initialKeyType=${RedisearchIndexKeyType.HASH}&initialPrefix=bikes%3A`,
    })
  })

  it('should map JSON key type to RedisearchIndexKeyType.JSON', async () => {
    renderComponent({ keyType: KeyTypes.ReJSON })

    await userEvent.click(screen.getByTestId('make-searchable-btn'))
    await userEvent.click(screen.getByTestId('make-searchable-modal-confirm'))

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining(
          `initialKeyType=${RedisearchIndexKeyType.JSON}`,
        ),
      }),
    )
  })

  it('should close modal on cancel', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('make-searchable-btn'))
    expect(screen.getByTestId('make-searchable-modal-body')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('make-searchable-modal-cancel'))
    expect(
      screen.queryByTestId('make-searchable-modal-body'),
    ).not.toBeInTheDocument()
  })
})
