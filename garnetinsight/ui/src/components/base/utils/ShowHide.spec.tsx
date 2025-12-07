import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import {
  Breakpoints,
  HideFor,
  ShowFor,
} from 'uiSrc/components/base/utils/ShowHide'

describe('ShowHide', () => {
  beforeAll(() => {
    // @ts-ignore innerWidth might be read only, but we can still override it for the sake of testing
    window.innerWidth = 670
  })
  afterAll(() => 1024) // reset to jsdom's default
  describe('HideFor', () => {
    it('should render', () => {
      expect(
        render(
          <HideFor sizes={['s']}>
            <span>Child</span>
          </HideFor>,
        ),
      ).toBeTruthy()
    })

    it('hides for matching breakpoints', () => {
      render(
        <HideFor sizes={['s']}>
          <span>Child</span>
        </HideFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })

    Breakpoints.forEach((size) => {
      it(`${size} is rendered`, () => {
        render(
          <HideFor sizes={[size]}>
            <span>Child</span>
          </HideFor>,
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
        <HideFor sizes={['m', 'l']}>
          <span>Child</span>
        </HideFor>,
      )

      expect(screen.getByText('Child')).toBeInTheDocument()
    })

    it('renders for "none"', () => {
      render(
        <HideFor sizes="none">
          <span>Child</span>
        </HideFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })

    test('never renders for "all"', () => {
      render(
        <HideFor sizes="all">
          <span>Child</span>
        </HideFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })
  })

  describe('ShowFor', () => {
    it('should render', () => {
      expect(
        render(
          <ShowFor sizes={['s']}>
            <span>Child</span>
          </ShowFor>,
        ),
      ).toBeTruthy()
    })

    it('shows for matching breakpoints', () => {
      render(
        <ShowFor sizes={['s']}>
          <span>Child</span>
        </ShowFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })

    Breakpoints.forEach((size) => {
      it(`${size} is rendered`, () => {
        render(
          <ShowFor sizes={[size]}>
            <span>Child</span>
          </ShowFor>,
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
        <ShowFor sizes={['s', 'xs']}>
          <span>Child</span>
        </ShowFor>,
      )

      expect(screen.getByText('Child')).toBeInTheDocument()
    })

    it('never renders for "none"', () => {
      render(
        <ShowFor sizes="none">
          <span>Child</span>
        </ShowFor>,
      )

      expect(screen.queryByText('Child')).not.toBeInTheDocument()
    })

    test('renders for "all"', () => {
      render(
        <ShowFor sizes="all">
          <span>Child</span>
        </ShowFor>,
      )

      expect(screen.queryByText('Child')).toBeInTheDocument()
    })
  })
})
