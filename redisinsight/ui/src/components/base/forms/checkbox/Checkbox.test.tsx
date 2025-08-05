import React from 'react'
import { fireEvent } from '@testing-library/react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { RiCheckbox } from './RiCheckbox'

describe('Checkbox', () => {
  it('Should render checkbox', () => {
    render(<RiCheckbox label="Checkbox Label" />)

    expect(screen.getByText('Checkbox Label')).toBeInTheDocument()
  })

  describe('Checkbox states', () => {
    it('Should render disabled checkbox when disabled prop is passed', () => {
      render(<RiCheckbox id="id1" label="Checkbox Label" disabled />)

      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
    it('Should render un-checked checkbox when checked prop is passed as false', () => {
      render(<RiCheckbox id="id1" label="Checkbox Label" checked={false} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
    it('Should render checked checkbox when checked prop is passed as true', () => {
      render(<RiCheckbox id="id1" label="Checkbox Label" checked />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
    it('Should render indeterminate checkbox when checked prop is passed as indeterminate', () => {
      render(
        <RiCheckbox id="id1" label="Checkbox Label" checked="indeterminate" />,
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveValue('on')
      expect(checkbox).toHaveTextContent('Minus')
    })
  })

  describe('change handlers', () => {
    it('Should call handlers when checkbox is clicked with thruthy values', () => {
      const onChange = jest.fn()
      const onCheckedChange = jest.fn()
      render(
        <RiCheckbox
          id="id1"
          label="Checkbox Label"
          onChange={onChange}
          onCheckedChange={onCheckedChange}
        />,
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(onChange).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith({
        target: {
          checked: true,
          type: 'checkbox',
          name: undefined,
          id: 'id1',
        },
      })
      expect(onCheckedChange).toHaveBeenCalled()
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })
    it('Should call handlers when checkbox is clicked with falsy values', () => {
      const onChange = jest.fn()
      const onCheckedChange = jest.fn()
      render(
        <RiCheckbox
          id="id1"
          label="Checkbox Label"
          onChange={onChange}
          onCheckedChange={onCheckedChange}
          checked
        />,
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(onChange).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith({
        target: {
          checked: false,
          type: 'checkbox',
          name: undefined,
          id: 'id1',
        },
      })
      expect(onCheckedChange).toHaveBeenCalled()
      expect(onCheckedChange).toHaveBeenCalledWith(false)
    })
    it('Should change state when clicked', () => {
      render(<RiCheckbox id="id1" label="Checkbox Label" defaultChecked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
      fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })
})
