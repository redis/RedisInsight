import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { render } from 'uiSrc/utils/test-utils'
import VirtualGrid from './VirtualGrid'
import { IProps } from './interfaces'

const mockedProps = mock<IProps>()

const columns: ITableColumn[] = [
  {
    id: 'name',
    label: 'Member',
    staySearchAlwaysOpen: true,
    initialSearchValue: '',
    truncateText: true,
    minWidth: 50,
  },
]

const items = ['member1', 'member2']

describe('VirtualGrid', () => {
  it('should render', () => {
    expect(render(<VirtualGrid {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows', () => {
    expect(
      render(
        <VirtualGrid
          {...instance(mockedProps)}
          items={items}
          columns={columns}
          loading={false}
          loadMoreItems={jest.fn()}
          totalItemsCount={items.length}
        />,
      ),
    ).toBeTruthy()
  })
})
