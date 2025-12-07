import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import BadgeIcon, { Props } from './BadgeIcon'

const mockedProps = mock<Props>()

const icon = <div />

describe('BadgeIcon', () => {
  it('should render', () => {
    expect(
      render(<BadgeIcon {...instance(mockedProps)} icon={icon} />),
    ).toBeTruthy()
  })
})
