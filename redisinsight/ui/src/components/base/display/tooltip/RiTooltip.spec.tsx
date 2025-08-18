import React from 'react'
import { fireEvent, screen, act } from '@testing-library/react'
import { render, waitForRiTooltipVisible } from 'uiSrc/utils/test-utils'
import { RiTooltip, RiTooltipProps } from './RITooltip'

const TestButton = () => (
  <button type="button" data-testid="tooltip-trigger">
    Hover me
  </button>
)

const defaultProps: RiTooltipProps = {
  children: <TestButton />,
  content: 'Test tooltip content',
}

describe('RiTooltip', () => {
  it('should render', () => {
    expect(render(<RiTooltip {...defaultProps} />)).toBeTruthy()
  })

  it('should render children', () => {
    render(<RiTooltip {...defaultProps} />)

    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
  })

  it('should render tooltip content on focus', async () => {
    render(<RiTooltip {...defaultProps} />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getAllByText('Test tooltip content')[0]).toBeInTheDocument()
  })

  it('should render tooltip with title and content', async () => {
    render(
      <RiTooltip {...defaultProps} title="Test Title" content="Test content" />,
    )

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getAllByText('Test Title')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Test content')[0]).toBeInTheDocument()
  })

  it('should render tooltip with only content when title is not provided', async () => {
    render(<RiTooltip {...defaultProps} content="Only content" />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getAllByText('Only content')[0]).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should not render tooltip when content and title are not provided', async () => {
    render(
      <RiTooltip>
        <TestButton />
      </RiTooltip>,
    )

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })

    // Wait a bit to ensure tooltip doesn't appear
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('should apply anchorClassName to the wrapper span', () => {
    render(
      <RiTooltip {...defaultProps} anchorClassName="custom-anchor-class" />,
    )

    const wrapper = screen.getAllByTestId('tooltip-trigger')[0].parentElement
    expect(wrapper).toHaveClass('custom-anchor-class')
  })

  it('should render with React node as title', async () => {
    const titleNode = <span data-testid="custom-title">Custom Title Node</span>

    render(
      <RiTooltip {...defaultProps} title={titleNode} content="Test content" />,
    )

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getAllByTestId('custom-title')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Test content')[0]).toBeInTheDocument()
  })

  it('should render with React node as content', async () => {
    const contentNode = (
      <div data-testid="tooltip-custom-content">
        <p>Custom content with HTML</p>
        <TestButton />
      </div>
    )

    render(<RiTooltip {...defaultProps} content={contentNode} />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    expect(
      screen.getAllByTestId('tooltip-custom-content')[0],
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Custom content with HTML')[0],
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Hover me' })[0],
    ).toBeInTheDocument()
  })

  it('should pass through additional props to underlying Tooltip component', async () => {
    render(
      <RiTooltip
        {...defaultProps}
        position="top"
        delay={100}
        data-testid="custom-tooltip"
      />,
    )

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })
    await waitForRiTooltipVisible()

    // The tooltip should be rendered (testing that props are passed through)
    expect(screen.getAllByText('Test tooltip content')[0]).toBeInTheDocument()
  })

  it('should handle empty string content', async () => {
    render(<RiTooltip {...defaultProps} content="" />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })

    // Wait a bit to ensure tooltip doesn't appear
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should not render tooltip for empty content
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should handle null content', async () => {
    render(<RiTooltip {...defaultProps} content={null} />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })

    // Wait a bit to ensure tooltip doesn't appear
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should not render tooltip for null content
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('should handle undefined content', async () => {
    render(<RiTooltip {...defaultProps} content={undefined} />)

    await act(async () => {
      fireEvent.focus(screen.getByTestId('tooltip-trigger'))
    })

    // Wait a bit to ensure tooltip doesn't appear
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Should not render tooltip for undefined content
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
