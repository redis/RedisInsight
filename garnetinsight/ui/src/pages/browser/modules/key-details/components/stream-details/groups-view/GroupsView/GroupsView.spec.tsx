import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import GroupsView, { Props, IConsumerGroup } from './GroupsView'

const mockedProps = mock<Props>()

const mockGroups: IConsumerGroup[] = [
  {
    name: 'test',
    consumers: 123,
    pending: 321,
    smallestPendingId: '123',
    greatestPendingId: '123',
    lastDeliveredId: '123',
    editing: false,
  },
  {
    name: 'test2',
    consumers: 13,
    pending: 31,
    smallestPendingId: '3',
    greatestPendingId: '23',
    lastDeliveredId: '12',
    editing: false,
  },
]

describe('GroupsView', () => {
  it('should render', () => {
    expect(
      render(<GroupsView {...instance(mockedProps)} data={mockGroups} />),
    ).toBeTruthy()
  })
})
