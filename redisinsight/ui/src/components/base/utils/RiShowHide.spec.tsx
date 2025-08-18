import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { Breakpoints, RiHideFor, RiShowFor } from './RiShowHide'

describe('RiShowHide', () => {
  beforeAll(() => {
    // @ts-ignore innerWidth might be read only, but we can still override it for the sake of testing
    window.innerWidth = 670
  })
  afterAll(() => 1024) // reset to jsdom's default
  describe('HideFor', () => {
    it('should render', () => {
      expect(
        render(
          <RiHideFor sizes={['s']}>
            <span>Child</span>
          </RiHideFor>,
        ),
      ).toBeTruthy()
    })

    it('hides for matching breakpoints', () => {
      render(
        <RiHideFor sizes={['s']}>
          <span>Child</span>
        </RiHideFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })

    Breakpoints.forEach((size) => {
      it(`${size} is rendered`, () => {
        render(
          <RiHideFor sizes={[size]}>
            <span>Child</span>
          </RiHideFor>,
        )

        const child = screen.queryByText('Child')
        if (size === 's') {
          expect(child).not.toBeInTheDocument()
          return
        }
        expect(child).toBeInTheDocument()
      })
    })

    it('renders for multiple breakpoints', () => {
      render(
        <RiHideFor sizes={['m', 'l']}>
          <span>Child</span>
        </RiHideFor>,
      )

      expect(screen.getByText('Child')).toBeInTheDocument()
    })

    it('renders for "none"', () => {
      render(
        <RiHideFor sizes="none">
          <span>Child</span>
        </RiHideFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })

    test('never renders for "all"', () => {
      render(
        <RiHideFor sizes="all">
          <span>Child</span>
        </RiHideFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })
  })

  describe('ShowFor', () => {
    it('should render', () => {
      expect(
        render(
          <RiShowFor sizes={['s']}>
            <span>Child</span>
          </RiShowFor>,
        ),
      ).toBeTruthy()
    })

    it('shows for matching breakpoints', () => {
      render(
        <RiShowFor sizes={['s']}>
          <span>Child</span>
        </RiShowFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })

    Breakpoints.forEach((size) => {
      it(`${size} is rendered`, () => {
        render(
          <RiShowFor sizes={[size]}>
            <span>Child</span>
          </RiShowFor>,
        )

        const child = screen.queryByText('Child')
        if (size === 's') {
          expect(child).toBeInTheDocument()
          return
        }
        expect(child).not.toBeInTheDocument()
      })
    })

    it('renders for multiple breakpoints', () => {
      render(
        <RiShowFor sizes={['s', 'xs']}>
          <span>Child</span>
        </RiShowFor>,
      )

      expect(screen.getByText('Child')).toBeInTheDocument()
    })

    it('never renders for "none"', () => {
      render(
        <RiShowFor sizes="none">
          <span>Child</span>
        </RiShowFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })

    test('renders for "all"', () => {
      render(
        <RiShowFor sizes="all">
          <span>Child</span>
        </RiShowFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })
  })
})
