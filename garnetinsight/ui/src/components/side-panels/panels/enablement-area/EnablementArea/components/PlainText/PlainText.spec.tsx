import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import PlainText, { Props } from './PlainText'

const mockedProps = mock<Props>()

describe('PlainText', () => {
  it('should render', () => {
    expect(render(<PlainText {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should contain provided children', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    const { container } = render(
      <PlainText {...instance(mockedProps)}>
        <span>{text}</span>
      </PlainText>,
    )
    expect(container).toHaveTextContent(text)
  })
})
