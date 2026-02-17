import React from 'react'
import reactRouterDom from 'react-router-dom'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
  userEvent,
  within,
} from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { Pages } from 'uiSrc/constants'
import { deleteRedisearchIndexAction } from 'uiSrc/slices/browser/redisearch'
import { indexListRowFactory } from 'uiSrc/mocks/factories/vector-search/indexList.factory'

import { useIndexListData } from '../../../../hooks/useIndexListData'
import { ListContent } from './ListContent'

jest.mock('../../../../hooks/useIndexListData', () => ({
  useIndexListData: jest.fn(() => ({
    data: [],
    loading: false,
  })),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  deleteRedisearchIndexAction: jest.fn().mockReturnValue({ type: 'delete' }),
}))

const mockPush = jest.fn()
const mockInstanceId = INSTANCE_ID_MOCK

const mockIndexRow = indexListRowFactory.build({
  id: 'test-index',
  name: 'test-index',
})

const getTestState = (): RootState => ({
  ...initialStateDefault,
  connections: {
    ...initialStateDefault.connections,
    instances: {
      ...initialStateDefault.connections.instances,
      connectedInstance: {
        ...initialStateDefault.connections.instances.connectedInstance,
        ...INSTANCES_MOCK[0],
      },
    },
  },
})

const renderComponent = () => {
  const store = mockStore(getTestState())
  return render(<ListContent />, { store })
}

describe('ListContent', () => {
  beforeEach(() => {
    cleanup()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: mockInstanceId })
    ;(useIndexListData as jest.Mock).mockReturnValue({
      data: [mockIndexRow],
      loading: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the index list table with data', () => {
    renderComponent()

    const table = screen.getByTestId('vector-search--list--table')
    expect(table).toBeInTheDocument()

    const indexName = screen.getByTestId(`index-name-${mockIndexRow.id}`)
    expect(indexName).toBeInTheDocument()
  })

  it('should render empty state when no data', () => {
    ;(useIndexListData as jest.Mock).mockReturnValue({
      data: [],
      loading: false,
    })

    renderComponent()

    const table = screen.getByTestId('vector-search--list--table')
    expect(table).toBeInTheDocument()

    const emptyMessage = screen.getByText('No indexes found')
    expect(emptyMessage).toBeInTheDocument()
  })

  it('should dispatch deleteRedisearchIndexAction when delete action is clicked', async () => {
    renderComponent()

    const actionsCell = screen.getByTestId('index-actions-test-index')
    const buttons = within(actionsCell).getAllByRole('button')
    const menuTrigger = buttons[buttons.length - 1]
    await userEvent.click(menuTrigger)

    const deleteBtn = screen.getByTestId('index-actions-delete-btn-test-index')
    await userEvent.click(deleteBtn)

    expect(deleteRedisearchIndexAction).toHaveBeenCalled()
  })

  it('should navigate to query page when query button is clicked', async () => {
    renderComponent()

    const queryBtn = screen.getByTestId(`index-query-btn-${mockIndexRow.id}`)
    await userEvent.click(queryBtn)

    expect(mockPush).toHaveBeenCalledWith(
      Pages.vectorSearchQuery(mockInstanceId, mockIndexRow.name),
    )
  })
})
