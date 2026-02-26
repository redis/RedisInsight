import React from 'react'
import { render, waitForRiPopoverVisible, screen } from 'uiSrc/utils/test-utils'
import { RiPopover } from './RiPopover'
import { RiPopoverProps } from './RiPopover.types'

const TestButton = () => (
  <button type="button" data-testid="popover-trigger">
    Click me
  </button>
)

const renderPopover = (overrides: Partial<RiPopoverProps> = {}) => {
  return render(
    <RiPopover
      button={<TestButton />}
      isOpen={false}
      closePopover={jest.fn()}
      {...overrides}
    >
      <div data-testid="popover-content">Popover content</div>
    </RiPopover>,
  )
}

describe('RiPopover', () => {
  it('should render', () => {
    expect(renderPopover()).toBeTruthy()
  })

  it('should render trigger button', () => {
    renderPopover()

    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
  })

  it('should render popover content when isOpen is true', async () => {
    renderPopover({ isOpen: true })

    await waitForRiPopoverVisible()

    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
  })

  it('should not render popover content when isOpen is false', () => {
    renderPopover({ isOpen: false })

    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument()
  })

  describe('button prop (legacy)', () => {
    it('should wrap button in span by default', () => {
      renderPopover()

      const trigger = screen.getByTestId('popover-trigger')
      const wrapper = trigger.parentElement

      expect(wrapper?.tagName).toBe('SPAN')
    })

    it('should apply anchorClassName to wrapper span', () => {
      renderPopover({ anchorClassName: 'custom-anchor-class' })

      const trigger = screen.getByTestId('popover-trigger')
      const wrapper = trigger.parentElement

      expect(wrapper).toHaveClass('custom-anchor-class')
    })
  })

  describe('trigger prop (new)', () => {
    it('should use trigger when provided', () => {
      renderPopover({
        trigger: <button data-testid="new-trigger">New Trigger</button>,
      })

      expect(screen.getByTestId('new-trigger')).toBeInTheDocument()
      expect(screen.queryByTestId('popover-trigger')).not.toBeInTheDocument()
    })

    it('should wrap trigger in span by default (standalone=false)', () => {
      renderPopover({
        trigger: <button data-testid="new-trigger">New Trigger</button>,
      })

      const trigger = screen.getByTestId('new-trigger')
      const wrapper = trigger.parentElement

      expect(wrapper?.tagName).toBe('SPAN')
    })

    it('should render trigger directly when standalone is true', () => {
      renderPopover({
        trigger: <div data-testid="standalone-trigger">Standalone</div>,
        standalone: true,
      })

      const trigger = screen.getByTestId('standalone-trigger')
      const wrapper = trigger.parentElement

      // Should not be wrapped in span
      expect(wrapper?.tagName).not.toBe('SPAN')
      expect(wrapper?.tagName).toBe('DIV')
    })

    it('should apply anchorClassName to wrapper when standalone is false', () => {
      renderPopover({
        trigger: <button data-testid="new-trigger">New Trigger</button>,
        anchorClassName: 'custom-anchor-class',
      })

      const trigger = screen.getByTestId('new-trigger')
      const wrapper = trigger.parentElement

      expect(wrapper).toHaveClass('custom-anchor-class')
    })

    it('should not apply anchorClassName when standalone is true', () => {
      renderPopover({
        trigger: <div data-testid="standalone-trigger">Standalone</div>,
        standalone: true,
        anchorClassName: 'custom-anchor-class',
      })

      const trigger = screen.getByTestId('standalone-trigger')

      // anchorClassName should not be applied since there's no wrapper
      expect(trigger).not.toHaveClass('custom-anchor-class')
    })
  })

  describe('prop conflicts and warnings', () => {
    it('should warn when both button and trigger are provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn')

      renderPopover({ trigger: <button>Trigger</button> })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[RiPopover]: Both 'button' and 'trigger' props are provided. Using 'trigger'. Please migrate to 'trigger' prop.",
      )
    })

    it('should warn when both panelClassName and className are provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn')

      renderPopover({
        panelClassName: 'old-class',
        className: 'new-class',
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[RiPopover]: Both 'panelClassName' and 'className' props are provided. Using 'className'. Please migrate to 'className' prop.",
      )
    })
  })

  describe('className prop', () => {
    it('should use className when provided', async () => {
      renderPopover({
        isOpen: true,
        className: 'custom-class',
      })

      await waitForRiPopoverVisible()

      const popover = screen.queryByRole('dialog')
      expect(popover).toBeInTheDocument()
      expect(popover).toHaveClass('custom-class')
    })

    it('should fall back to panelClassName when className is not provided', async () => {
      renderPopover({
        isOpen: true,
        panelClassName: 'fallback-class',
      })

      await waitForRiPopoverVisible()

      const popover = screen.queryByRole('dialog')
      expect(popover).toBeInTheDocument()
      expect(popover).toHaveClass('fallback-class')
    })

    it('should prefer className over panelClassName when both are provided', async () => {
      renderPopover({
        isOpen: true,
        panelClassName: 'old-class',
        className: 'new-class',
      })

      await waitForRiPopoverVisible()

      const popover = screen.queryByRole('dialog')

      expect(popover).toBeInTheDocument()
      expect(popover).toHaveClass('new-class')
      expect(popover).not.toHaveClass('old-class')
    })
  })

  describe('panelPaddingSize', () => {
    it('should apply padding style based on panelPaddingSize', async () => {
      renderPopover({
        isOpen: true,
        panelPaddingSize: 'm',
      })

      await waitForRiPopoverVisible()

      const popover = screen.queryByRole('dialog')

      expect(popover).toBeInTheDocument()
      expect(popover).toHaveStyle({ padding: '18px' })
    })

    it('should apply no padding when panelPaddingSize is none', async () => {
      renderPopover({
        isOpen: true,
        panelPaddingSize: 'none',
      })

      await waitForRiPopoverVisible()

      const popover = screen.queryByRole('dialog')

      expect(popover).toBeInTheDocument()
      expect(popover).toHaveStyle({ padding: '0px' })
    })
  })

  describe('scalar trigger values', () => {
    it('should wrap string trigger in span', () => {
      const { container } = renderPopover({ trigger: 'String trigger' })

      const text = screen.getByText('String trigger')
      // The Popover component might wrap our span in a div, so check if span exists
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span).toContainElement(text)
    })

    it('should wrap number trigger in span', () => {
      const { container } = renderPopover({ trigger: 123 })

      const text = screen.getByText('123')
      // The Popover component might wrap our span in a div, so check if span exists
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span).toContainElement(text)
    })

    it('should wrap scalar trigger in span when standalone is true', () => {
      // When standalone is true and trigger is a scalar (string, number, etc.),
      // we wrap it in a span because RadixPopover.Trigger with asChild requires a React element
      const { container } = renderPopover({
        trigger: 'String trigger',
        standalone: true,
      })

      const text = screen.getByText('String trigger')
      // Should be wrapped in a span (without anchorClassName)
      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span).toContainElement(text)
      // The span should not have anchorClassName when standalone is true
      expect(span).not.toHaveClass()
    })
  })

  describe('backwards compatibility', () => {
    it('should work with button prop only (legacy behavior)', () => {
      renderPopover()

      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    })

    it('should work with panelClassName prop only (legacy behavior)', async () => {
      const { getByRole } = renderPopover({
        isOpen: true,
        panelClassName: 'legacy-class',
      })

      await waitForRiPopoverVisible()

      const popover = getByRole('dialog')
      expect(popover).toBeInTheDocument()
      expect(popover).toHaveClass('legacy-class')
    })
  })
})
