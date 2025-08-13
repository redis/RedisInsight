import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  CreateIndexStepWrapper,
  CreateIndexStepWrapperProps,
  IndexStepTab,
  VectorIndexTab,
} from './CreateIndexStepWrapper'
import { BuildNewIndexTabTrigger } from './build-new-index-tab/BuildNewIndexTabTrigger'

const VECTOR_INDEX_TABS: IndexStepTab[] = [
  {
    value: VectorIndexTab.BuildNewIndex,
    label: <BuildNewIndexTabTrigger />,
    disabled: true,
  },
  {
    value: VectorIndexTab.UsePresetIndex,
    label: 'Use preset index',
    content: (
      <div data-testid="vector-index-tabs--use-preset-index-content">
        Use preset index content
      </div>
    ),
  },
]

const renderComponent = (props?: Partial<CreateIndexStepWrapperProps>) =>
  render(<CreateIndexStepWrapper tabs={VECTOR_INDEX_TABS} {...props} />)

describe('CreateIndexStepWrapper', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    // Check if the tabs are rendered
    const buildNewIndexTabTrigger = screen.getByText('Build new index')
    const usePresetIndexTabTrigger = screen.getByText('Use preset index')

    expect(buildNewIndexTabTrigger).toBeInTheDocument()
    expect(usePresetIndexTabTrigger).toBeInTheDocument()

    // Check if the "Use preset index" tab content is selected by default
    const usePresetIIndexTabContent = screen.queryByTestId(
      'vector-index-tabs--use-preset-index-content',
    )
    expect(usePresetIIndexTabContent).toBeInTheDocument()
  })

  it('should switch to "Use preset index" tab when clicked', () => {
    const props: CreateIndexStepWrapperProps = {
      tabs: [
        {
          value: VectorIndexTab.BuildNewIndex,
          label: 'Build new index',
          content: (
            <div data-testid="vector-index-tabs--build-new-index-content">
              Build new index content
            </div>
          ),
        },
        {
          value: VectorIndexTab.UsePresetIndex,
          label: 'Use preset index',
          content: (
            <div data-testid="vector-index-tabs--use-preset-index-content">
              Use preset index content
            </div>
          ),
        },
      ],
    }

    renderComponent(props)

    // Verify the initial render to ensure "Build new index" is selected
    const buildNewIndexTabContent = screen.queryByTestId(
      'vector-index-tabs--build-new-index-content',
    )
    expect(buildNewIndexTabContent).toBeInTheDocument()

    // Click on the "Use preset index" tab
    const buildNewIndexTabTrigger = screen.getByText('Use preset index')
    fireEvent.click(buildNewIndexTabTrigger)

    // Check if the "Use preset index" tab is rendered
    const usePresetIndexTabContent = screen.queryByTestId(
      'vector-index-tabs--use-preset-index-content',
    )
    expect(usePresetIndexTabContent).toBeInTheDocument()
  })

  it("shouldn't switch to 'Build new index' tab when clicked, since it is disabled", () => {
    renderComponent()

    const buildNewIndexTabTriggerLabel = screen.getByText('Build new index')
    const buildNewIndexTabTriggerButton =
      buildNewIndexTabTriggerLabel.closest('[type="button"]')

    expect(buildNewIndexTabTriggerButton).toBeDisabled()

    // And when clicked, it should not change the active tab
    fireEvent.click(buildNewIndexTabTriggerLabel)

    // Check if the "Use preset index" tab is still active
    const usePresetIndexTabContent = screen.queryByTestId(
      'vector-index-tabs--use-preset-index-content',
    )
    expect(usePresetIndexTabContent).toBeInTheDocument()
  })
})
