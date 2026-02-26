import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { KeysBrowser } from './KeysBrowser'

describe('KeysBrowser', () => {
  describe('Compose', () => {
    it('should render children', () => {
      render(
        <KeysBrowser.Compose>
          <span>content</span>
        </KeysBrowser.Compose>,
      )
      expect(screen.getByText('content')).toBeInTheDocument()
    })

    it('should use default data-testid', () => {
      render(
        <KeysBrowser.Compose>
          <span>content</span>
        </KeysBrowser.Compose>,
      )
      expect(screen.getByTestId('keys-browser')).toBeInTheDocument()
    })

    it('should accept custom data-testid', () => {
      render(
        <KeysBrowser.Compose data-testid="custom-root">
          <span>content</span>
        </KeysBrowser.Compose>,
      )
      expect(screen.getByTestId('custom-root')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <KeysBrowser.Compose className="my-class">
          <span>content</span>
        </KeysBrowser.Compose>,
      )
      expect(screen.getByTestId('keys-browser')).toHaveClass('my-class')
    })
  })

  describe('Header', () => {
    it('should render children', () => {
      render(
        <KeysBrowser.Header>
          <span>header content</span>
        </KeysBrowser.Header>,
      )
      expect(screen.getByText('header content')).toBeInTheDocument()
    })

    it('should use default data-testid', () => {
      render(
        <KeysBrowser.Header>
          <span>header</span>
        </KeysBrowser.Header>,
      )
      expect(screen.getByTestId('keys-browser-header')).toBeInTheDocument()
    })

    it('should accept custom data-testid', () => {
      render(
        <KeysBrowser.Header data-testid="custom-header">
          <span>header</span>
        </KeysBrowser.Header>,
      )
      expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <KeysBrowser.Header className="header-class">
          <span>header</span>
        </KeysBrowser.Header>,
      )
      expect(screen.getByTestId('keys-browser-header')).toHaveClass(
        'header-class',
      )
    })
  })

  describe('Content', () => {
    it('should render children', () => {
      render(
        <KeysBrowser.Content>
          <span>main content</span>
        </KeysBrowser.Content>,
      )
      expect(screen.getByText('main content')).toBeInTheDocument()
    })

    it('should use default data-testid', () => {
      render(
        <KeysBrowser.Content>
          <span>content</span>
        </KeysBrowser.Content>,
      )
      expect(screen.getByTestId('keys-browser-content')).toBeInTheDocument()
    })

    it('should accept custom data-testid', () => {
      render(
        <KeysBrowser.Content data-testid="custom-content">
          <span>content</span>
        </KeysBrowser.Content>,
      )
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <KeysBrowser.Content className="content-class">
          <span>content</span>
        </KeysBrowser.Content>,
      )
      expect(screen.getByTestId('keys-browser-content')).toHaveClass(
        'content-class',
      )
    })
  })

  describe('Footer', () => {
    it('should render children', () => {
      render(
        <KeysBrowser.Footer>
          <span>footer content</span>
        </KeysBrowser.Footer>,
      )
      expect(screen.getByText('footer content')).toBeInTheDocument()
    })

    it('should use default data-testid', () => {
      render(
        <KeysBrowser.Footer>
          <span>footer</span>
        </KeysBrowser.Footer>,
      )
      expect(screen.getByTestId('keys-browser-footer')).toBeInTheDocument()
    })

    it('should accept custom data-testid', () => {
      render(
        <KeysBrowser.Footer data-testid="custom-footer">
          <span>footer</span>
        </KeysBrowser.Footer>,
      )
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <KeysBrowser.Footer className="footer-class">
          <span>footer</span>
        </KeysBrowser.Footer>,
      )
      expect(screen.getByTestId('keys-browser-footer')).toHaveClass(
        'footer-class',
      )
    })
  })

  describe('composed layout', () => {
    it('should render all slots together', () => {
      render(
        <KeysBrowser.Compose>
          <KeysBrowser.Header>
            <span>header</span>
          </KeysBrowser.Header>
          <KeysBrowser.Content>
            <span>content</span>
          </KeysBrowser.Content>
          <KeysBrowser.Footer>
            <span>footer</span>
          </KeysBrowser.Footer>
        </KeysBrowser.Compose>,
      )

      expect(screen.getByTestId('keys-browser')).toBeInTheDocument()
      expect(screen.getByTestId('keys-browser-header')).toBeInTheDocument()
      expect(screen.getByTestId('keys-browser-content')).toBeInTheDocument()
      expect(screen.getByTestId('keys-browser-footer')).toBeInTheDocument()

      expect(screen.getByText('header')).toBeInTheDocument()
      expect(screen.getByText('content')).toBeInTheDocument()
      expect(screen.getByText('footer')).toBeInTheDocument()
    })
  })
})
