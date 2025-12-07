import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import ShortcutsFlyout from './ShortcutsFlyout'
import { SHORTCUTS, ShortcutGroup } from './schema'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/components/base/layout/drawer', () => ({
  ...jest.requireActual('uiSrc/components/base/layout/drawer'),
  DrawerHeader: jest.fn().mockReturnValue(null),
}))

const appInfoSlicesPath = 'uiSrc/slices/app/info'

jest.mock(appInfoSlicesPath, () => ({
  ...jest.requireActual(appInfoSlicesPath),
  appInfoSelector: jest.fn().mockReturnValue({
    ...jest.requireActual(appInfoSlicesPath).appInfoSelector,
    isShortcutsFlyoutOpen: true,
  }),
}))

describe('ShortcutsFlyout', () => {
  it('should render', () => {
    expect(render(<ShortcutsFlyout />)).toBeTruthy()
  })

  it('should render groups', () => {
    render(<ShortcutsFlyout />)

    SHORTCUTS.forEach((group: ShortcutGroup) => {
      expect(
        document.querySelector(
          `[data-test-subj="shortcuts-section-${group.name}"]`,
        ),
      ).toBeInTheDocument()
    })
  })
})
