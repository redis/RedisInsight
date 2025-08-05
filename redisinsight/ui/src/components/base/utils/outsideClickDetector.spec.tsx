import React from 'react'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { RiOutsideClickDetector } from './RiOutsideClickDetector'

describe('RiOutsideClickDetector', () => {
  it('is rendered', () => {
    const { container } = render(
      <RiOutsideClickDetector onOutsideClick={() => {}}>
        <div />
      </RiOutsideClickDetector>,
    )
    expect(container.firstChild).toBeTruthy()
  })

  describe('behavior', () => {
    test('nested detectors', async () => {
      const unrelatedDetector = jest.fn()
      const parentDetector = jest.fn()
      const childDetector = jest.fn()

      const { findByTestId } = render(
        <div role="button" tabIndex={0}>
          <div>
            <RiOutsideClickDetector onOutsideClick={parentDetector}>
              <div>
                <RiOutsideClickDetector onOutsideClick={childDetector}>
                  <div data-testid="target1" />
                </RiOutsideClickDetector>
              </div>
            </RiOutsideClickDetector>
          </div>

          <RiOutsideClickDetector onOutsideClick={unrelatedDetector}>
            <div data-testid="target2" />
          </RiOutsideClickDetector>
        </div>,
      )
      const target2 = await findByTestId('target2')
      fireEvent.mouseDown(target2)
      fireEvent.mouseUp(target2)

      expect(unrelatedDetector).toHaveBeenCalledTimes(0)
      expect(childDetector).toHaveBeenCalledTimes(1)
      expect(parentDetector).toHaveBeenCalledTimes(1)
    })
  })
})
