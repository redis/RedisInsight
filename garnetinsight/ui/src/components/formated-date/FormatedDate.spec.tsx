import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { formatTimestamp } from 'uiSrc/utils'
import FormatedDate, { Props } from './FormatedDate'

const mockedProps = mock<Props>()
const mockedDate = new Date('2012-12-12').getTime()

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsConfigSelector: jest.fn().mockReturnValue({
    dateFormat: 'y',
    timezone: 'UTC',
  }),
}))

describe('FormatedDate', () => {
  it('should render', () => {
    expect(
      render(<FormatedDate {...instance(mockedProps)} date={mockedDate} />),
    ).toBeTruthy()
  })

  it('should formatDate relying on user config settings', () => {
    render(<FormatedDate {...instance(mockedProps)} date={mockedDate} />)
    expect(screen.getByText('2012')).toBeTruthy()
  })

  it('should formatDate relying on default settings if no settings saved yet', () => {
    ;(userSettingsConfigSelector as jest.Mock).mockImplementation(() => ({
      dateFormat: null,
      timezone: null,
    }))
    render(<FormatedDate {...instance(mockedProps)} date={mockedDate} />)
    expect(screen.getByText(formatTimestamp(mockedDate))).toBeTruthy()
  })
})
