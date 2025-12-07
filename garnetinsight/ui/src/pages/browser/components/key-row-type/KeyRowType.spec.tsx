import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import KeyRowType, { Props } from './KeyRowType'

const mockedProps = mock<Props>()
const loadingTestId = 'type-loading_'
const nameString = 'name'

describe('KeyRowType', () => {
  it('should render', () => {
    expect(render(<KeyRowType {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render Loading if no type', () => {
    const { queryByTestId } = render(
      <KeyRowType {...instance(mockedProps)} nameString={nameString} />,
    )

    expect(queryByTestId(loadingTestId + nameString)).toBeInTheDocument()
  })

  it('should render Badge if type exists', () => {
    const type = KeyTypes.Hash
    const { queryByTestId } = render(
      <KeyRowType
        {...instance(mockedProps)}
        nameString={nameString}
        type={type}
      />,
    )

    expect(queryByTestId(loadingTestId + nameString)).not.toBeInTheDocument()
    expect(queryByTestId(`badge-${type}_${nameString}`)).toBeInTheDocument()
  })
})
