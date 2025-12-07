import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'
import Image, { Props } from './Image'

const mockedProps = mock<Props>()

describe('Image', () => {
  it('should render', () => {
    expect(render(<Image {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render image with absolute path', () => {
    const path = 'https://image.com/image.png'
    const { container } = render(
      <Image {...instance(mockedProps)} src={path} />,
    )
    expect(container.querySelector('img')?.getAttribute('src')).toEqual(path)
  })

  it('should render image with path to static folder', () => {
    const path = 'static/image.png'
    const { container } = render(
      <Image {...instance(mockedProps)} src={path} />,
    )
    expect(container.querySelector('img')?.getAttribute('src')).toEqual(
      `${RESOURCES_BASE_URL}${path}`,
    )
  })
})
