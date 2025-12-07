import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'uiSrc/utils/test-utils'
import { truncateNumberToFirstUnit } from 'uiSrc/utils'
import KeyRowTTL, { Props } from './KeyRowTTL'

const mockedProps = mock<Props>()
const loadingTestId = 'ttl-loading_'
const nameString = 'name'

describe('KeyRowTTL', () => {
  it('should render', () => {
    expect(render(<KeyRowTTL {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Loading if no ttl', () => {
    const { queryByTestId } = render(
      <KeyRowTTL
        {...instance(mockedProps)}
        ttl={undefined}
        nameString={nameString}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).toBeInTheDocument()
  })

  it('should render "No limit" if ttl is -1', () => {
    const { queryByTestId } = render(
      <KeyRowTTL {...instance(mockedProps)} ttl={-1} nameString={nameString} />,
    )

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
    expect(queryByTestId(`ttl-${nameString}`)).toHaveTextContent('No limit')
  })

  it('should render formatted ttl', () => {
    const ttl = 123123123
    const { queryByTestId } = render(
      <KeyRowTTL
        {...instance(mockedProps)}
        ttl={123123123}
        nameString={nameString}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
    expect(queryByTestId(`ttl-${nameString}`)).toHaveTextContent(
      truncateNumberToFirstUnit(ttl),
    )
  })
})
