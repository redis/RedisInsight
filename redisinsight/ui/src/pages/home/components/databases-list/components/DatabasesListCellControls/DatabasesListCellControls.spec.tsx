import React from 'react'
import {
  render,
  screen,
  userEvent,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import { Instance } from 'uiSrc/slices/interfaces'
import {
  HomePageDataProviderProvider,
  useHomePageDataProvider,
  OpenDialogName,
} from 'uiSrc/pages/home/contexts/HomePageDataProvider'

import DatabasesListCellControls from './DatabasesListCellControls'

// Handlers mocks
const mockHandleManageInstanceTags = jest.fn()
const mockHandleClickGoToCloud = jest.fn()
const mockHandleClickEditInstance = jest.fn()
const mockHandleDeleteInstances = jest.fn()
const mockHandleClickDeleteInstance = jest.fn()

jest.mock('./methods/handlers', () => ({
  handleManageInstanceTags: (...args: any[]) =>
    mockHandleManageInstanceTags(...args),
  handleClickGoToCloud: (...args: any[]) => mockHandleClickGoToCloud(...args),
  handleClickEditInstance: (...args: any[]) =>
    mockHandleClickEditInstance(...args),
  handleDeleteInstances: (...args: any[]) => mockHandleDeleteInstances(...args),
  handleClickDeleteInstance: (...args: any[]) =>
    mockHandleClickDeleteInstance(...args),
}))

const instance: Instance = {
  id: 'db-1',
  name: 'My DB',
  host: 'h',
  port: 6379,
  modules: [],
  version: null,
  provider: 'LOCALHOST',
  cloudDetails: { test: true } as any,
}

const row = { original: instance }

const openDialogSpy = jest.fn()
const Observer = () => {
  const { openDialog } = useHomePageDataProvider()
  React.useEffect(() => {
    openDialogSpy(openDialog)
  }, [openDialog])
  return null
}

const renderWithProvider = () =>
  render(
    <HomePageDataProviderProvider>
      <>
        <Observer />
        {React.createElement(DatabasesListCellControls as any, { row })}
      </>
    </HomePageDataProviderProvider>,
  )

describe('DatabasesListCellControls component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show manage tags and call handler + open dialog', async () => {
    renderWithProvider()

    const btn = await screen.findByTestId(`manage-instance-tags-${instance.id}`)
    await userEvent.click(btn)

    expect(mockHandleManageInstanceTags).toHaveBeenCalledWith(instance)
    expect(openDialogSpy).toHaveBeenLastCalledWith(OpenDialogName.ManageTags)
  })

  it('should show cloud link and call go-to-cloud handler', async () => {
    renderWithProvider()

    const link = await screen.findByTestId(`cloud-link-${instance.id}`)
    await userEvent.click(link)

    expect(mockHandleClickGoToCloud).toHaveBeenCalled()
  })

  it('should call edit handler and open edit dialog from popover', async () => {
    renderWithProvider()

    await userEvent.click(screen.getByTestId(`controls-button-${instance.id}`))
    await waitForRiPopoverVisible()
    const editBtn = await screen.findByTestId(`edit-instance-${instance.id}`)
    await userEvent.click(editBtn)

    expect(mockHandleClickEditInstance).toHaveBeenCalledWith(instance)
    expect(openDialogSpy).toHaveBeenLastCalledWith(OpenDialogName.EditDatabase)
  })

  it('should trigger delete click and confirm delete', async () => {
    renderWithProvider()

    await userEvent.click(screen.getByTestId(`controls-button-${instance.id}`))
    await waitForRiPopoverVisible()
    const trigger = await screen.findByTestId(
      `delete-instance-${instance.id}-icon`,
    )
    await userEvent.click(trigger)
    expect(mockHandleClickDeleteInstance).toHaveBeenCalledWith(instance)

    await waitForRiPopoverVisible()
    const confirm = await screen.findByTestId(`delete-instance-${instance.id}`)
    await userEvent.click(confirm, { pointerEventsCheck: 0 })

    expect(mockHandleDeleteInstances).toHaveBeenCalledWith(instance)
    expect(openDialogSpy).toHaveBeenLastCalledWith(null)
  })
})
