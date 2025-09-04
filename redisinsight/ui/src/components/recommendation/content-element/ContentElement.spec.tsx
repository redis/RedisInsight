import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ContentElement, { Props } from './ContentElement'

const mockedProps = mock<Props>()

const mockTelemetryName = 'name'

describe('ContentElement', () => {
  it('should render', () => {
    expect(render(<ContentElement {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render paragraph', () => {
    const mockContent = {
      type: 'paragraph',
      value: 'paragraph',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`paragraph-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render span', () => {
    const mockContent = {
      type: 'span',
      value: 'span',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`span-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render code', () => {
    const mockContent = {
      type: 'code',
      value: 'code',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`code-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render spacer', () => {
    const mockContent = {
      type: 'spacer',
      value: 'l',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`spacer-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render link', () => {
    const mockContent = {
      type: 'link',
      value: 'link',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`link-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render code link', () => {
    const mockContent = {
      type: 'code-link',
      value: 'link',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`code-link-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render link-sso', () => {
    const mockContent = {
      type: 'link-sso',
      value: 'link-sso',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`link-sso-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render internal-link', () => {
    const mockContent = {
      type: 'internal-link',
      value: {
        path: '/some-path',
        name: 'name',
      },
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`internal-link-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render list', () => {
    const mockContent = {
      type: 'list',
      value: [[]],
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(
      screen.queryByTestId(`list-${mockTelemetryName}-0`),
    ).toBeInTheDocument()
  })

  it('should render unknown', () => {
    const mockContent = {
      type: 'unknown',
      value: 'unknown',
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('should not failed when value is not the string', () => {
    const mockContent = {
      type: 'unknown',
      value: { custom: 'value' },
    }
    render(
      <ContentElement
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    expect(screen.getByText('*Unknown format*')).toBeInTheDocument()
  })

  it('click on link should call onClick', () => {
    const onClickMock = jest.fn()
    const mockContent = {
      type: 'link',
      value: 'link',
    }

    const { queryByTestId } = render(
      <ContentElement
        onLinkClick={onClickMock}
        content={mockContent}
        telemetryName={mockTelemetryName}
        idx={0}
      />,
    )

    fireEvent.click(queryByTestId(`link-${mockTelemetryName}-0`) as HTMLElement)

    expect(onClickMock).toHaveBeenCalled()
  })
})
