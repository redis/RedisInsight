import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { BaseProps } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import { stringToBuffer } from 'uiSrc/utils'
import * as appFeaturesSlice from 'uiSrc/slices/app/features'
import RejsonDetails from './RejsonDetails'

const mockedProps = mock<BaseProps>()

const mockedJSONObject = [
  {
    key: '_id',
    path: '$["_id"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282e738b05531b345',
  },
  {
    key: '_id2',
    path: '$["_id"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282b05531b345',
  },
  {
    key: '_id3',
    path: '$["_id"]',
    cardinality: 3,
    type: 'array',
    value: [1, 2, 3],
  },
]

const mockedJSONString = 'string'
const mockedJSONNull = null
const mockedJSONBoolean = true
const mockedJSONNumber = 123123
const mockedSelectedKey = stringToBuffer('key')

const mockEnvDependentFeatureFlag = (value = true) => {
  jest
    .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
    .mockReturnValue({
      envDependent: {
        flag: value,
      },
    })
}

describe('RejsonDetails', () => {
  it('should render', () => {
    expect(
      render(
        <RejsonDetails
          {...instance(mockedProps)}
          selectedKey={mockedSelectedKey}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render switch editor button ENABLED when envDependent flag is enabled', () => {
    mockEnvDependentFeatureFlag()

    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONObject}
        dataType="object"
        parentPath="$"
        selectedKey={mockedSelectedKey}
        isDownloaded={false}
      />,
    )

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).toBeEnabled()
  })

  it('should render switch editor button DISABLED when envDependent flag is enabled', () => {
    mockEnvDependentFeatureFlag(false)

    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONObject}
        dataType="object"
        parentPath="$"
        selectedKey={mockedSelectedKey}
        isDownloaded={false}
      />,
    )

    const button = screen.getByRole('button', { name: /change editor type/i })
    expect(button).not.toBeEnabled()
  })

  describe('should render JSON object', () => {
    it('should be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONObject}
            dataType="object"
            selectedKey={mockedSelectedKey}
            isDownloaded={false}
          />,
        ),
      ).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONObject}
            dataType="object"
            selectedKey={mockedSelectedKey}
            isDownloaded
          />,
        ),
      ).toBeTruthy()
    })
  })

  describe('should render JSON array', () => {
    it('should not be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={[1, 2, 3]}
            dataType="array"
            selectedKey={mockedSelectedKey}
            isDownloaded
          />,
        ),
      ).toBeTruthy()
    })
  })

  describe('should render JSON string', () => {
    it('should be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONString}
            dataType="string"
            parentPath="$"
            selectedKey={mockedSelectedKey}
            isDownloaded={false}
          />,
        ),
      ).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONString}
            dataType="string"
            parentPath="$"
            selectedKey={mockedSelectedKey}
            isDownloaded
          />,
        ),
      ).toBeTruthy()
    })
  })

  describe('should render JSON null', () => {
    it('should be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONNull}
            dataType="null"
            parentPath="$"
            selectedKey={mockedSelectedKey}
            isDownloaded={false}
          />,
        ),
      ).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(
        render(
          <RejsonDetails
            {...instance(mockedProps)}
            data={mockedJSONNull}
            dataType="null"
            parentPath="$"
            selectedKey={mockedSelectedKey}
            isDownloaded
          />,
        ),
      ).toBeTruthy()
    })
  })

  it('should render JSON boolean', () => {
    expect(
      render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONBoolean}
          dataType="boolean"
          parentPath="$"
          selectedKey={mockedSelectedKey}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render JSON number', () => {
    expect(
      render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONNumber}
          dataType="number"
          parentPath="$"
          selectedKey={mockedSelectedKey}
        />,
      ),
    ).toBeTruthy()
  })

  it('should open inline editor to add JSON key value for object', () => {
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ a: 1, b: 2 }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))
    expect(screen.getByTestId('json-key')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toBeInTheDocument()
  })

  it.skip('should be able to add proper key value into json object', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ a: 1, b: 2 }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"value"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(handleSubmitJsonUpdateValue).toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })

  it.skip('should not be able to add wrong key value into json object', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ a: 1, b: 2 }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '{' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(handleSubmitJsonUpdateValue).not.toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })

  it.skip('should be able to add proper value into json array', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={[1, 2, 3]}
        dataType="array"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '1' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(handleSubmitJsonUpdateValue).toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })

  it.skip('should not be able to add wrong value into json array', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={[1, 2, 3]}
        dataType="array"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '{' },
    })
    expect(handleSubmitJsonUpdateValue).not.toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })

  it.skip('should submit to add proper key value into json object', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={{ a: 1, b: 2 }}
        dataType="object"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"value"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(handleSubmitJsonUpdateValue).toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })

  it.skip('should submit to add proper value into json array', () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleSubmitUpdateValue = jest.fn()
    render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={[1, 2, 3]}
        dataType="array"
        selectedKey={mockedSelectedKey}
        isDownloaded
      />,
    )

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '1' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(handleSubmitJsonUpdateValue).toBeCalled()
    expect(handleSubmitUpdateValue).not.toBeCalled()
  })
})
