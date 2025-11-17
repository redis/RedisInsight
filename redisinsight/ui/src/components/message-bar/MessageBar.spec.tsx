import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, waitFor } from 'uiSrc/utils/test-utils'
import { riToast } from 'uiSrc/components/base/display/toast'
import MessageBar, { Props } from './MessageBar'

const mockedProps = mock<Props>()

const renderMessageBar = async (
  children: React.ReactElement,
  opened = true,
  variant?: typeof riToast.Variant.Success | typeof riToast.Variant.Attention,
) => {
  const screen = render(
    <MessageBar {...instance(mockedProps)} opened={opened} variant={variant}>
      {children}
    </MessageBar>,
  )
  if (!opened) {
    return { ...screen }
  }
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
    const { getByTestId, getByText } = await renderMessageBar(
      <p data-testid="text">lorem ipsum</p>,
    )
    expect(getByTestId('text')).toBeTruthy()
    expect(getByText('lorem ipsum')).toBeInTheDocument()
  })

  it('should display toast with success variant by default', async () => {
    const { getByTestId } = await renderMessageBar(
      <p data-testid="default-variant">Default variant test</p>,
    )

    const toast = getByTestId('redisui-toast')
    expect(toast.closest('.success')).toBeInTheDocument()
  })

  it('should display toast with attention variant when specified', async () => {
    const { getByTestId } = await renderMessageBar(
      <p data-testid="attention-variant">Attention variant test</p>,
      true,
      riToast.Variant.Attention,
    )

    const toast = getByTestId('redisui-toast')
    expect(toast.closest('.attention')).toBeInTheDocument()
  })

  it('should not display toast when opened is false', async () => {
    const { queryByTestId } = await renderMessageBar(
      <p data-testid="closed-message">Should not appear</p>,
      false,
    )

    expect(queryByTestId('closed-message')).not.toBeInTheDocument()
  })

  it('should render complex children content in toast', async () => {
    const { getByTestId, getByText } = await renderMessageBar(
      <div data-testid="complex-content">
        <h3>Title</h3>
        <p>Description text</p>
        <button type="button">Action</button>
      </div>,
    )

    expect(getByTestId('complex-content')).toBeInTheDocument()
    expect(getByText('Title')).toBeInTheDocument()
    expect(getByText('Description text')).toBeInTheDocument()
    expect(getByText('Action')).toBeInTheDocument()
  })
})
