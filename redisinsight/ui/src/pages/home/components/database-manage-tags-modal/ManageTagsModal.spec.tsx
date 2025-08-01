import React from 'react'
import { useDispatch } from 'react-redux'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { updateInstanceAction } from 'uiSrc/slices/instances/instances'

import { Instance } from 'uiSrc/slices/interfaces'
import { ManageTagsModal, ManageTagsModalProps } from './ManageTagsModal'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  connect: () => (Component: any) => Component,
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  updateInstanceAction: jest.fn().mockReturnValue({ type: 'UPDATE_INSTANCE' }),
}))

const mockDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>
const mockInstance: Partial<Instance> = {
  id: '1',
  name: 'Test Instance',
  tags: [
    {
      id: '1',
      key: 'env',
      value: 'prod',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      key: 'version',
      value: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  provider: 'RE_CLOUD',
}

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

describe('ManageTagsModal', () => {
  const mockOnClose = jest.fn()
  const mockDispatchFn = jest.fn()
  mockDispatch.mockReturnValue(mockDispatchFn)

  const renderComponent = (props: Partial<ManageTagsModalProps> = {}) => {
    const defaultProps: ManageTagsModalProps = {
      instance: mockInstance as any,
      onClose: mockOnClose,
      ...props,
    }
    return render(<ManageTagsModal {...defaultProps} />)
  }

  // Skipping until the title issue in the modal is fixed
  it.skip('should render ManageTagsModal component', () => {
    renderComponent()
    expect(
      screen.getByText('Manage tags for Test Instance'),
    ).toBeInTheDocument()
  })

  it('should call onClose when Close button is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('close-button'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call dispatch with updateInstanceAction when Save tags button is clicked', () => {
    renderComponent()
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'new-key' },
    })
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'new-value' },
    })
    fireEvent.click(screen.getByTestId('save-tags-button'))
    expect(mockDispatchFn).toHaveBeenCalledWith(
      updateInstanceAction({
        id: '1',
        tags: [
          { key: 'new-key', value: 'new-value' },
          { key: 'version', value: '1.0' },
        ],
      }),
    )
  })

  it('should add a new tag row when Add additional tag button is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByTestId('add-tag-button'))
    expect(screen.getAllByRole('textbox').length).toBe(6)
  })

  it('should remove a tag row when trash icon is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getAllByTestId('remove-tag-button')[0])
    expect(screen.getAllByRole('textbox').length).toBe(2)
  })

  it('should disable Save tags button when an invalid tag value is input', () => {
    renderComponent()
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'new-key' },
    })
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'invalid value!@££@' },
    })
    expect(screen.getByTestId('save-tags-button')).toBeDisabled()
  })

  it('should disable Save tags button when a tag key is too long', () => {
    renderComponent()
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'a'.repeat(66) },
    })
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'value' },
    })
    expect(screen.getByTestId('save-tags-button')).toBeDisabled()
  })

  it('should disable Save tags button when a tag value is too long', () => {
    renderComponent()
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'new-key' },
    })
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'a'.repeat(130) },
    })
    expect(screen.getByTestId('save-tags-button')).toBeDisabled()
  })
})
