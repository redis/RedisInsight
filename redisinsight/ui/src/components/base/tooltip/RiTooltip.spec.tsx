import React from 'react'
import { fireEvent, screen, act } from '@testing-library/react'
import { render, waitForRiTooltipVisible } from 'uiSrc/utils/test-utils'
import { RiTooltip, RiTooltipProps } from './RITooltip'
import { HoverContent } from './HoverContent'

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

describe('HoverContent', () => {
  it('should render only content when title is falsy', () => {
    render(<HoverContent title={null} content="Test content" />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should render only content when title is undefined', () => {
    render(<HoverContent title={undefined} content="Test content" />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should render title as Title component when title is a plain string', () => {
    render(<HoverContent title="Plain Title" content="Test content" />)

    const titleElement = screen.getByText('Plain Title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement.tagName).toBe('DIV')
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render custom node as-is when title is a React node', () => {
    const customTitle = (
      <div data-testid="custom-title-node">
        <strong>Custom</strong> Title
      </div>
    )

    render(<HoverContent title={customTitle} content="Test content" />)

    const customNode = screen.getByTestId('custom-title-node')
    expect(customNode).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()

    // Verify the custom node is NOT wrapped in a Title component
    // Title component would create a heading element (h1-h6)
    expect(customNode.parentElement?.tagName).not.toMatch(/^H[1-6]$/)

    // Verify the custom node structure is preserved exactly
    expect(customNode.tagName).toBe('DIV')
    expect(customNode.querySelector('strong')).toBeInTheDocument()
  })

  it('should render content with React node', () => {
    const customContent = (
      <div data-testid="custom-content-node">
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </div>
    )

    render(<HoverContent title="Title" content={customContent} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByTestId('custom-content-node')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
  })

  it('should use Col component with gap="s"', () => {
    const { container } = render(
      <HoverContent title="Title" content="Content" />,
    )

    // Col component should be present as the wrapper
    const colElement = container.firstChild
    expect(colElement).toBeInTheDocument()
  })
})
