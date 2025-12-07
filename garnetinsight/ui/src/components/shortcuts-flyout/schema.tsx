import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'

export interface Shortcut {
  label?: string
  description: string
  keys: (string | JSX.Element)[]
}

export interface ShortcutGroup {
  name: string
  items: Shortcut[]
  excludeFor?: BuildType[]
}

export const separator = KEYBOARD_SHORTCUTS._separator

export const SHORTCUTS: ShortcutGroup[] = [
  {
    name: 'Desktop application',
    excludeFor: [BuildType.RedisStack, BuildType.DockerOnPremise],
    items: [
      KEYBOARD_SHORTCUTS.desktop.newWindow,
      KEYBOARD_SHORTCUTS.desktop.reloadPage,
    ],
  },
  {
    name: 'CLI',
    items: [
      KEYBOARD_SHORTCUTS.cli.autocompleteNext,
      KEYBOARD_SHORTCUTS.cli.autocompletePrev,
      KEYBOARD_SHORTCUTS.cli.clearSearch,
      KEYBOARD_SHORTCUTS.cli.prevCommand,
      KEYBOARD_SHORTCUTS.cli.nextCommand,
    ],
  },
  {
    name: 'Workbench',
    items: [
      KEYBOARD_SHORTCUTS.workbench.runQuery,
      KEYBOARD_SHORTCUTS.workbench.nextLine,
      KEYBOARD_SHORTCUTS.workbench.listOfCommands,
      KEYBOARD_SHORTCUTS.workbench.triggerHints,
      KEYBOARD_SHORTCUTS.workbench.quickHistoryAccess,
      KEYBOARD_SHORTCUTS.workbench.nonRedisEditor,
    ],
  },
]
