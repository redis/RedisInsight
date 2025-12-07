import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'uiSrc/utils/test-utils'
import { formatBytes } from 'uiSrc/utils'
import KeyRowSize, { Props } from './KeyRowSize'

const mockedProps = mock<Props>()
const loadingTestId = 'size-loading_'
const nameString = 'name'

describe('KeyRowSize', () => {
  it('should render', () => {
    expect(render(<KeyRowSize {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Loading if no size', () => {
    const { queryByTestId } = render(
      <KeyRowSize
        {...instance(mockedProps)}
        size={undefined}
        nameString={nameString}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).toBeInTheDocument()
  })

  it('should render "-" if size is empty', () => {
    const { queryByTestId } = render(
      <KeyRowSize
        {...instance(mockedProps)}
        size={0}
        nameString={nameString}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
    expect(queryByTestId(`size-${nameString}`)).toHaveTextContent('-')
  })

  it('should render formatted size', () => {
    const size = 123123123
    const { queryByTestId } = render(
      <KeyRowSize
        {...instance(mockedProps)}
        size={123123123}
        nameString={nameString}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
    expect(queryByTestId(`size-${nameString}`)).toHaveTextContent(
      formatBytes(size, 0) as string,
    )
  })
})
