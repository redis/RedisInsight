import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import KeyRowName, { Props } from './KeyRowName'

const mockedProps = mock<Props>()

const loadingTestId = 'name-loading'

describe('KeyRowName', () => {
  it('should render', () => {
    expect(render(<KeyRowName {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Loading if no nameString and shortName', () => {
    const { queryByTestId } = render(
      <KeyRowName nameString={undefined} shortName={undefined} />,
    )

    expect(queryByTestId(loadingTestId)).toBeInTheDocument()
  })

  it('content should be no more than 200 symbols', () => {
    const longName = Array.from({ length: 250 }, () => '1').join('')
    const { queryByTestId } = render(
      <KeyRowName nameString={longName} shortName={longName} />,
    )

    expect(queryByTestId(loadingTestId)).not.toBeInTheDocument()
    expect(queryByTestId(`key-${longName}`)).toHaveTextContent(
      longName.slice(0, 200),
    )
  })
})
