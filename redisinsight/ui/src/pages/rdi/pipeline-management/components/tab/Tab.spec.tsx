import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import Tab, { IProps } from './Tab'

const mockedProps = mock<IProps>()

describe('Tab', () => {
  it('should render', () => {
    expect(render(<Tab {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should display the title', () => {
    render(<Tab title="Pipeline Config" isSelected={false} />)

    expect(screen.getByText('Pipeline Config')).toBeInTheDocument()
  })

  it('should apply active class when selected', () => {
    const { container } = render(<Tab title="Pipeline Config" isSelected />)

    expect(container.firstChild).toHaveClass('active')
  })

  it('should display fileName if provided', () => {
    render(<Tab title="Tab Title" isSelected={false} fileName="config.yaml" />)

    expect(screen.getByText('config.yaml')).toBeInTheDocument()
  })

  it('should show an error icon when isValid is false', () => {
    render(
      <Tab
        title="Invalid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid={false}
      />,
    )

    expect(screen.getByTestId('rdi-nav-config-error')).toBeInTheDocument()
  })

  it('should not show an error icon when isValid is true', () => {
    render(
      <Tab
        title="Valid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid
      />,
    )

    expect(screen.queryByTestId('rdi-nav-config-error')).not.toBeInTheDocument()
  })

  it('should show a loading spinner when isLoading is true', () => {
    render(
      <Tab
        title="Loading Config"
        fileName="config.yaml"
        isSelected={false}
        isLoading
      />,
    )

    expect(screen.getByTestId('rdi-nav-config-loader')).toBeInTheDocument()
  })

  it('should not show a loading spinner when isLoading is false', () => {
    render(
      <Tab
        title="Config"
        fileName="config.yaml"
        isSelected={false}
        isLoading={false}
      />,
    )

    expect(
      screen.queryByTestId('rdi-nav-config-loader'),
    ).not.toBeInTheDocument()
  })

  it('should render children correctly', () => {
    render(
      <Tab title="With Children" isSelected={false}>
        <span data-testid="tab-child">Child Content</span>
      </Tab>,
    )

    expect(screen.getByTestId('tab-child')).toBeInTheDocument()
  })

  it('should display validation errors in tooltip when isValid is false and validationErrors are provided', () => {
    const validationErrors = [
      'Missing required field: name',
      'Invalid data type for age'
    ]

    render(
      <Tab
        title="Invalid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid={false}
        validationErrors={validationErrors}
      />
    )

    expect(screen.getByTestId('rdi-nav-config-error')).toBeInTheDocument()

    const errorIcon = screen.getByTestId('rdi-nav-config-error')
    expect(errorIcon).toBeInTheDocument()
  })

  it('should not display validation errors when isValid is true even if validationErrors are provided', () => {
    const validationErrors = [
      'Some validation error'
    ]

    render(
      <Tab
        title="Valid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid
        validationErrors={validationErrors}
      />
    )

    expect(screen.queryByTestId('rdi-nav-config-error')).not.toBeInTheDocument()
  })

  it('should display error icon even when validationErrors is empty but isValid is false', () => {
    render(
      <Tab
        title="Invalid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid={false}
        validationErrors={[]}
      />
    )

    expect(screen.getByTestId('rdi-nav-config-error')).toBeInTheDocument()
  })

  it('should handle validationErrors prop correctly when not provided', () => {
    render(
      <Tab
        title="Invalid Config"
        isSelected={false}
        fileName="config.yaml"
        isValid={false}
      />
    )

    expect(screen.getByTestId('rdi-nav-config-error')).toBeInTheDocument()
  })

  it('should not show error icon when fileName is not provided even if isValid is false', () => {
    render(
      <Tab
        title="Invalid Config"
        isSelected={false}
        isValid={false}
        validationErrors={['Some error']}
      />
    )

    expect(screen.queryByTestId('rdi-nav-config-error')).not.toBeInTheDocument()
  })
})
