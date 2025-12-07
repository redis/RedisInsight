import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ClusterConnectionForm, {
  Props as ClusterConnectionFormProps,
} from './cluster-connection-form/ClusterConnectionForm'
import ClusterConnectionFormWrapper, {
  Props,
} from './ClusterConnectionFormWrapper'

const mockedProps = mock<Props>()

jest.mock('./cluster-connection-form/ClusterConnectionForm', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockClusterConnectionForm = (props: ClusterConnectionFormProps) => (
  <div>
    <button
      type="button"
      onClick={() => props.onHostNamePaste('redis-12000.cluster.local:12000')}
      data-testid="onHostNamePaste-btn"
    >
      onHostNamePaste
    </button>
    <button
      type="button"
      onClick={() => props.onSubmit()}
      data-testid="onSubmit-btn"
    >
      onSubmit
    </button>
    <button
      type="button"
      onClick={() => props.onClose()}
      data-testid="onClose-btn"
    >
      onClose
    </button>
  </div>
)

describe('ClusterConnectionFormWrapper', () => {
  beforeAll(() => {
    ClusterConnectionForm.mockImplementation(mockClusterConnectionForm)
  })
  it('should render', () => {
    expect(
      render(<ClusterConnectionFormWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should call onHostNamePaste', () => {
    const component = render(
      <ClusterConnectionFormWrapper {...instance(mockedProps)} />,
    )
    fireEvent.click(screen.getByTestId('onHostNamePaste-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onSubmit', () => {
    const component = render(
      <ClusterConnectionFormWrapper {...instance(mockedProps)} />,
    )
    fireEvent.click(screen.getByTestId('onSubmit-btn'))
    expect(component).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(
      <ClusterConnectionFormWrapper
        {...instance(mockedProps)}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByTestId('onClose-btn'))
    expect(onClose).toBeCalled()
  })
})
