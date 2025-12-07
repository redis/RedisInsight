import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import PromoLink, { Props } from './PromoLink'

const mockedProps = mock<Props>()
const testId = 'promoLink'

describe('PromoLink', () => {
  it('should render', () => {
    expect(render(<PromoLink {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should correctly render content', () => {
    const title = 'Limited offer'
    const description = 'Try Redis Cloud'

    const { container } = render(
      <PromoLink
        {...instance(mockedProps)}
        title={title}
        description={description}
        testId={testId}
      />,
    )

    expect(container).toHaveTextContent(title)
    expect(container).toHaveTextContent(description)
  })
  it('should call "handleClick"', () => {
    const handleClick = jest.fn()

    const renderer = render(
      <PromoLink
        {...instance(mockedProps)}
        onClick={handleClick}
        testId={testId}
      />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId(testId))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
