import { ParseKeys } from 'i18next'
import { KEYBOARD_SHORTCUTS, Shortcut } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'

export type { Shortcut }

export interface ShortcutGroup {
  name: string
  nameKey: ParseKeys
  items: Shortcut[]
  excludeFor?: BuildType[]
}

export const separator = KEYBOARD_SHORTCUTS._separator

export const SHORTCUTS: ShortcutGroup[] = [
  {
    name: 'Desktop application',
    nameKey: 'shortcuts.group.desktop',
    excludeFor: [BuildType.RedisStack, BuildType.DockerOnPremise],
    items: [
      KEYBOARD_SHORTCUTS.desktop.newWindow,
      KEYBOARD_SHORTCUTS.desktop.reloadPage,
    ],
  },
  {
    name: 'CLI',
    nameKey: 'shortcuts.group.cli',
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
    nameKey: 'shortcuts.group.workbench',
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
