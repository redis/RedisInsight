import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, waitFor } from 'uiSrc/utils/test-utils'
import MessageBar, { Props } from './MessageBar'

const mockedProps = mock<Props>()

const renderMessageBar = async (children: React.ReactElement) => {
  const screen = render(
    <MessageBar {...instance(mockedProps)} opened>
      {children}
    </MessageBar>,
  )
  await waitFor(
    () => expect(screen.queryByTestId('redisui-toast')).toBeInTheDocument(),
    { timeout: 1000 },
  )
  return { ...screen }
}

describe('MessageBar', () => {
  it('should render', () => {
    expect(render(<MessageBar {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render children', async () => {
    const { getByTestId } = await renderMessageBar(
      <p data-testid="text">lorem ipsum</p>,
    )
    expect(getByTestId('text')).toBeTruthy()
  })
})
