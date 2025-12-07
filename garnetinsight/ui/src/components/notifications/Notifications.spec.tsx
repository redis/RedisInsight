import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import Notifications from './Notifications'

jest.mock('uiSrc/slices/app/notifications', () => ({
  ...jest.requireActual('uiSrc/slices/app/notifications'),
  messagesSelector: jest.fn().mockReturnValue([
    {
      id: '1',
      title: 'Header text',
      message: 'Body text',
    },
  ]),
  errorsSelector: jest.fn().mockReturnValue([
    {
      id: '2',
      message: 'Body text',
    },
  ]),
  removeMessage: jest.fn,
}))

describe('Notifications', () => {
  it('should render', () => {
    expect(render(<Notifications />)).toBeTruthy()
  })
})
