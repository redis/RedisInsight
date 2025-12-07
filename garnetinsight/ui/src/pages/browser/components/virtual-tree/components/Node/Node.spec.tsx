import React from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes, BrowserColumns } from 'uiSrc/constants'
import Node from './Node'
import { TreeData } from '../../interfaces'
import { mockVirtualTreeResult } from '../../VirtualTree.spec'

const mockDataFullName = 'test'
const mockedProps = mock<NodePublicState<TreeData>>()
const mockedPropsData = mock<TreeData>()

const mockedData: TreeData = {
  ...instance(mockedPropsData),
  nestingLevel: 3,
  isLeaf: true,
  path: '0.0.5.6',
  fullName: mockDataFullName,
  nameString: mockDataFullName,
  nameBuffer: stringToBuffer(mockDataFullName),
}

const mockedDataWithMetadata = {
  ...mockedData,
  type: KeyTypes.Hash,
  ttl: 123,
  size: 123,
}

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  useDisposableWebworker: () => ({
    result: mockVirtualTreeResult,
    run: jest.fn(),
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Node', () => {
  it('should render', () => {
    expect(
      render(<Node {...instance(mockedProps)} data={mockedData} />),
    ).toBeTruthy()
  })

  it('should render arrow and folder icons for Node properly', () => {
    const mockData: TreeData = {
      ...mockedData,
      isLeaf: false,
      fullName: mockDataFullName,
    }

    const { container } = render(
      <Node {...instance(mockedProps)} data={mockData} />,
    )

    expect(
      container.querySelector(
        `[data-test-subj="node-arrow-icon_${mockDataFullName}"`,
      ),
    ).toBeInTheDocument()
    expect(
      container.querySelector(
        `[data-test-subj="node-folder-icon_${mockDataFullName}"`,
      ),
    ).toBeInTheDocument()
  })

  it('"setItems", "updateStatusSelected", "mockGetMetadata" should be called after click on Leaf', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockGetMetadata = jest.fn()

    const mockData: TreeData = {
      ...mockedData,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
      getMetadata: mockGetMetadata,
    }

    render(
      <Node
        {...instance(mockedProps)}
        setOpen={mockSetOpen}
        isOpen={false}
        data={mockData}
      />,
    )

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).toBeCalledWith(mockData.nameBuffer)
    expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    expect(mockGetMetadata).toBeCalledWith(mockData.nameBuffer, mockData.path)
    expect(mockSetOpen).not.toBeCalled()
  })

  it('"mockGetMetadata" not be call if size and ttl exists', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockGetMetadata = jest.fn()

    const mockData: TreeData = {
      ...mockedDataWithMetadata,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
      getMetadata: mockGetMetadata,
    }

    render(
      <Node
        {...instance(mockedProps)}
        setOpen={mockSetOpen}
        isOpen={false}
        data={mockData}
      />,
    )

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).toBeCalledWith(mockData.nameBuffer)
    expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    expect(mockGetMetadata).not.toBeCalled()
    expect(mockSetOpen).not.toBeCalled()
  })

  it('name, ttl and size should be rendered', () => {
    const { getByTestId } = render(
      <Node {...instance(mockedProps)} data={mockedDataWithMetadata} />,
    )

    expect(getByTestId(`node-item_${mockDataFullName}`)).toBeInTheDocument()
    expect(
      getByTestId(`badge-${mockedDataWithMetadata.type}_${mockDataFullName}`),
    ).toBeInTheDocument()
    expect(getByTestId(`ttl-${mockDataFullName}`)).toBeInTheDocument()
    expect(getByTestId(`size-${mockDataFullName}`)).toBeInTheDocument()
  })

  it('"updateStatusOpen", "setOpen" should be called after click on Node', () => {
    const mockUpdateStatusSelected = jest.fn()
    const mockUpdateStatusOpen = jest.fn()
    const mockSetOpen = jest.fn()
    const mockIsOpen = false

    const mockData: TreeData = {
      ...mockedData,
      isLeaf: mockIsOpen,
      fullName: mockDataFullName,
      updateStatusSelected: mockUpdateStatusSelected,
      updateStatusOpen: mockUpdateStatusOpen,
    }

    render(
      <Node
        {...instance(mockedProps)}
        isOpen={false}
        setOpen={mockSetOpen}
        data={mockData}
      />,
    )

    screen.getByTestId(`node-item_${mockDataFullName}`).click()

    expect(mockUpdateStatusSelected).not.toBeCalled()
    expect(mockUpdateStatusOpen).toHaveBeenCalledWith(
      mockDataFullName,
      !mockIsOpen,
    )
    expect(mockSetOpen).toBeCalledWith(!mockIsOpen)
  })

  describe('Node metadata and column visibility', () => {
    it('should call getMetadata when node is clicked and TTL column is visible', () => {
      const mockGetMetadata = jest.fn()
      const mockUpdateStatusSelected = jest.fn()
      const mockUpdateStatusOpen = jest.fn()

      const mockData: TreeData = {
        ...mockedData,
        getMetadata: mockGetMetadata,
        updateStatusSelected: mockUpdateStatusSelected,
        updateStatusOpen: mockUpdateStatusOpen,
      }

      render(<Node {...instance(mockedProps)} data={mockData} />)

      screen.getByTestId(`node-item_${mockDataFullName}`).click()

      expect(mockGetMetadata).toBeCalledWith(
        mockedData.nameBuffer,
        mockedData.path,
      )
      expect(mockUpdateStatusSelected).toBeCalledWith(mockedData.nameBuffer)
      expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
    })

    it('should not call getMetadata when node is clicked and metadata exists', () => {
      const mockGetMetadata = jest.fn()
      const mockUpdateStatusSelected = jest.fn()
      const mockUpdateStatusOpen = jest.fn()

      const mockData: TreeData = {
        ...mockedDataWithMetadata,
        getMetadata: mockGetMetadata,
        updateStatusSelected: mockUpdateStatusSelected,
        updateStatusOpen: mockUpdateStatusOpen,
      }

      render(<Node {...instance(mockedProps)} data={mockData} />)

      screen.getByTestId(`node-item_${mockDataFullName}`).click()

      expect(mockUpdateStatusSelected).toBeCalledWith(
        mockedDataWithMetadata.nameBuffer,
      )
      expect(mockUpdateStatusOpen).toBeCalledWith(mockDataFullName, true)
      expect(mockGetMetadata).not.toBeCalled()
    })

    it('should render TTL and Size when metadata exists', () => {
      render(<Node {...instance(mockedProps)} data={mockedDataWithMetadata} />)

      expect(screen.getByTestId(`ttl-${mockDataFullName}`)).toBeInTheDocument()
      expect(screen.getByTestId(`size-${mockDataFullName}`)).toBeInTheDocument()
    })

    it('should not render TTL and Size when metadata does not exist', () => {
      render(<Node {...instance(mockedProps)} data={mockedData} />)

      expect(
        screen.queryByTestId(`ttl-${mockDataFullName}`),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(`size-${mockDataFullName}`),
      ).not.toBeInTheDocument()
    })

    it.each`
      description      | initialState                                                | updatedState
      ${'TTL column'}  | ${{ app: { context: { dbConfig: { shownColumns: [] } } } }} | ${{ app: { context: { dbConfig: { shownColumns: [BrowserColumns.TTL] } } } }}
      ${'Size column'} | ${{ app: { context: { dbConfig: { shownColumns: [] } } } }} | ${{ app: { context: { dbConfig: { shownColumns: [BrowserColumns.Size] } } } }}
    `(
      'should refetch metadata when $description is re-enabled even with existing metadata',
      ({ initialState, updatedState }) => {
        const mockGetMetadata = jest.fn()
        const mockData: TreeData = {
          ...mockedDataWithMetadata,
          getMetadata: mockGetMetadata,
        }

        const store = {
          getState: () => initialState,
          subscribe: jest.fn(),
          dispatch: jest.fn(),
        }

        const { rerender } = render(
          <Node {...instance(mockedProps)} data={mockData} />,
          { store },
        )

        store.getState = () => updatedState

        rerender(<Node {...instance(mockedProps)} data={mockData} />)

        expect(mockGetMetadata).toHaveBeenCalledWith(
          mockData.nameBuffer,
          mockData.path,
        )
      },
    )

    it.each`
      columns                                      | description
      ${[]}                                        | ${'no columns are shown'}
      ${[BrowserColumns.TTL]}                      | ${'only TTL column is shown'}
      ${[BrowserColumns.Size]}                     | ${'only Size column is shown'}
      ${[BrowserColumns.TTL, BrowserColumns.Size]} | ${'both TTL and Size columns are shown'}
    `('should render DeleteKeyPopover when $description', ({ columns }) => {
      const mockData: TreeData = {
        ...mockedDataWithMetadata,
        onDelete: jest.fn(),
        onDeleteClicked: jest.fn(),
      }

      const store = {
        getState: () => ({
          app: {
            context: {
              dbConfig: {
                shownColumns: columns,
              },
            },
          },
        }),
        subscribe: jest.fn(),
        dispatch: jest.fn(),
      }

      const { container } = render(
        <Node {...instance(mockedProps)} data={mockData} />,
        { store },
      )

      expect(
        container.querySelector(
          `[data-testid="delete-key-btn-${mockData.nameString}"]`,
        ),
      ).toBeInTheDocument()
    })
  })
})
