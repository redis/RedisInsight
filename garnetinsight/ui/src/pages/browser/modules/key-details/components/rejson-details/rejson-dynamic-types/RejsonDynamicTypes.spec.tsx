import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { DynamicTypesProps } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import RejsonDynamicTypes from './RejsonDynamicTypes'

const mockedProps = mock<DynamicTypesProps>()

const mockedDownloadedSimpleArray = [1, 2, 3]

describe('RejsonDynamicTypes Component', () => {
  it('renders correctly simple downloaded JSON', () => {
    render(
      <RejsonDynamicTypes
        {...instance(mockedProps)}
        data={mockedDownloadedSimpleArray}
        isDownloaded
      />,
    )

    expect(screen.queryAllByTestId('json-scalar-value')).toHaveLength(3)
  })
})
