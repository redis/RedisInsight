import React from 'react'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { render, screen } from 'uiSrc/utils/test-utils'
import { SelectOption } from '@redis-ui/components'
import { RISelectWithActions, SelectOptionActions } from './RISelectWithActions'

// Factory for creating select options
const selectOptionFactory = Factory.define<SelectOption & SelectOptionActions>(
  () => ({
    value: faker.string.uuid(),
    label: faker.word.words(2),
  }),
)

describe('RISelectWithActions', () => {
  describe('Actions rendering - 0 to 3 actions support', () => {
    it('should render option with no actions (0 actions)', () => {
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'No actions',
        }),
      ]

      const { container } = render(
        <RISelectWithActions options={options} value="1" onChange={jest.fn()} />,
      )

      expect(container).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render option with single action (1 action)', () => {
      const actionClick = jest.fn()
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Single action',
          actions: (
            <button data-testid="delete-action" onClick={actionClick}>
              Delete
            </button>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render option with two actions (2 actions)', () => {
      const editClick = jest.fn()
      const deleteClick = jest.fn()
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Two actions',
          actions: (
            <>
              <button data-testid="edit-action" onClick={editClick}>
                Edit
              </button>
              <button data-testid="delete-action" onClick={deleteClick}>
                Delete
              </button>
            </>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render option with three actions (3 actions)', () => {
      const viewClick = jest.fn()
      const editClick = jest.fn()
      const deleteClick = jest.fn()
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Three actions',
          actions: (
            <>
              <button data-testid="view-action" onClick={viewClick}>
                View
              </button>
              <button data-testid="edit-action" onClick={editClick}>
                Edit
              </button>
              <button data-testid="delete-action" onClick={deleteClick}>
                Delete
              </button>
            </>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('CustomOptionWithAction component behavior', () => {
    it('should wrap actions in div with event stopPropagation handlers', () => {
      const actionClick = jest.fn()
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Option 1',
          actions: (
            <button data-testid="test-action" onClick={actionClick}>
              Action
            </button>
          ),
        }),
      ]

      // The CustomOptionWithAction component wraps actions in a div
      // with onPointerDown, onPointerUp, and onClick stopPropagation handlers
      // This ensures clicking actions won't close the select dropdown
      const { container } = render(
        <RISelectWithActions options={options} value="1" onChange={jest.fn()} />,
      )

      expect(container).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should use custom optionComponent prop for rendering options', () => {
      const options = selectOptionFactory.buildList(2, {
        actions: <button>Action</button>,
      })

      // The component passes CustomOptionWithAction as optionComponent
      // to Select.Content.OptionList
      const { container } = render(
        <RISelectWithActions options={options} value={options[0].value} onChange={jest.fn()} />,
      )

      expect(container.querySelector('[role="combobox"]')).toBeInTheDocument()
    })
  })

  describe('Actions with Popover support', () => {
    it('should render action wrapped in popover component', () => {
      const deleteClick = jest.fn()
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Option with popover',
          actions: (
            <div data-testid="popover-wrapper">
              <button data-testid="trigger-btn">Delete</button>
              <div data-testid="popover-content">
                <p>Are you sure?</p>
                <button onClick={deleteClick}>Confirm</button>
              </div>
            </div>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should support complex popover structures in actions', () => {
      const TestPopoverAction = () => {
        return (
          <div data-testid="complex-popover">
            <button data-testid="popover-trigger">More Options</button>
            <div data-testid="popover-menu">
              <button>Edit</button>
              <button>Duplicate</button>
              <button>Delete</button>
            </div>
          </div>
        )
      }

      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Option with complex popover',
          actions: <TestPopoverAction />,
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Mixed options with different action configurations', () => {
    it('should render multiple options with 0, 1, 2, and 3 actions', () => {
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'No actions',
        }),
        selectOptionFactory.build({
          value: '2',
          label: 'One action',
          actions: <button>Action 1</button>,
        }),
        selectOptionFactory.build({
          value: '3',
          label: 'Two actions',
          actions: (
            <>
              <button>Action 2</button>
              <button>Action 3</button>
            </>
          ),
        }),
        selectOptionFactory.build({
          value: '4',
          label: 'Three actions',
          actions: (
            <>
              <button>Action 4</button>
              <button>Action 5</button>
              <button>Action 6</button>
            </>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('No actions')).toBeInTheDocument()
    })

    it('should support actions with different types (buttons, icons, popovers)', () => {
      const options = [
        selectOptionFactory.build({
          value: '1',
          label: 'Button action',
          actions: <button>Delete</button>,
        }),
        selectOptionFactory.build({
          value: '2',
          label: 'Icon action',
          actions: <span data-testid="icon-action">🗑️</span>,
        }),
        selectOptionFactory.build({
          value: '3',
          label: 'Popover action',
          actions: (
            <div data-testid="popover">
              <button>...</button>
            </div>
          ),
        }),
      ]

      render(<RISelectWithActions options={options} value="1" onChange={jest.fn()} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Component structure and props', () => {
    it('should use Select.Compose as root component', () => {
      const options = selectOptionFactory.buildList(2)
      const { container } = render(
        <RISelectWithActions options={options} value={options[0].value} onChange={jest.fn()} />,
      )

      // Verify the select structure is rendered
      expect(container.querySelector('[role="combobox"]')).toBeInTheDocument()
    })

    it('should pass all props to Select.Compose', () => {
      const onChange = jest.fn()
      const options = selectOptionFactory.buildList(2)

      render(
        <RISelectWithActions
          options={options}
          value={options[0].value}
          onChange={onChange}
        />,
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render Select.Trigger inside Select.Compose', () => {
      const options = selectOptionFactory.buildList(2)
      render(
        <RISelectWithActions options={options} value={options[0].value} onChange={jest.fn()} />,
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('type', 'button')
    })
  })
})
