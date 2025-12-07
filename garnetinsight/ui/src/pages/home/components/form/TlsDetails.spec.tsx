import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act, render } from 'uiSrc/utils/test-utils'
import TlsDetails, { Props } from './TlsDetails'

const mockedProps = mock<Props>()

describe('TlsDetails', () => {
  it('should render', async () => {
    let renderResult
    await act(async () => {
      renderResult = render(
        <TlsDetails
          {...instance(mockedProps)}
          formik={{
            // @ts-ignore
            values: {
              tls: false,
            },
            setFieldValue: jest.fn(),
            setFieldTouched: jest.fn(),
            errors: {},
            touched: {},
            handleChange: jest.fn(),
            handleBlur: jest.fn(),
          }}
        />,
      )
    })
    expect(renderResult).toBeTruthy()
  })
})
