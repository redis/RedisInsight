import React from 'react'
import { mock } from 'ts-mockito'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { render, screen } from 'uiSrc/utils/test-utils'

import DatabaseAlias, { Props } from './DatabaseAlias'

const mockedProps = mock<Props>()

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {},
  }),
}))

describe('DatabaseAlias', () => {
  it('should render', () => {
    expect(render(<DatabaseAlias {...mockedProps} />)).toBeTruthy()
  })

  it('should not render part of content in edit mode', () => {
    render(<DatabaseAlias {...mockedProps} isCloneMode={false} alias="alias" />)

    expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('db-alias')).toHaveTextContent('alias')
  })

  it('should render icon for redis-stack', () => {
    render(<DatabaseAlias {...mockedProps} isRediStack />)

    expect(screen.queryByTestId('redis-stack-icon')).toBeInTheDocument()
  })

  it('should not render clone button with buildType=REDIS_STACK', () => {
    ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
      ...mockAppInfoSelector,
      server: {
        buildType: BuildType.RedisStack,
      },
    }))

    render(<DatabaseAlias {...mockedProps} />)

    expect(screen.queryByTestId('clone-db-btn')).not.toBeInTheDocument()
  })
})
