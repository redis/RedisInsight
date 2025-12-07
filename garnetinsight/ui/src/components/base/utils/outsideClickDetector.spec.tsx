import React from 'react'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { OutsideClickDetector } from 'uiSrc/components/base/utils/OutsideClickDetector'

describe('OutsideClickDetector', () => {
  it('is rendered', () => {
    const { container } = render(
      <OutsideClickDetector onOutsideClick={() => {}}>
        <div />
      </OutsideClickDetector>,
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
            <OutsideClickDetector onOutsideClick={parentDetector}>
              <div>
                <OutsideClickDetector onOutsideClick={childDetector}>
                  <div data-testid="target1" />
                </OutsideClickDetector>
              </div>
            </OutsideClickDetector>
          </div>

          <OutsideClickDetector onOutsideClick={unrelatedDetector}>
            <div data-testid="target2" />
          </OutsideClickDetector>
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
