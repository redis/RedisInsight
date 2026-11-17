import React from 'react'
import { ParseKeys } from 'i18next'
import { isMacOs } from 'uiSrc/utils/dom'

export interface Shortcut {
  descriptionKey: ParseKeys
  keys: (string | JSX.Element)[]
}

interface KeyboardShortcuts {
  _separator: string
  desktop: Record<'newWindow' | 'reloadPage', Shortcut>
  cli: Record<
    | 'autocompleteNext'
    | 'autocompletePrev'
    | 'clearSearch'
    | 'prevCommand'
    | 'nextCommand',
    Shortcut
  >
  workbench: Record<
    | 'runQuery'
    | 'nextLine'
    | 'listOfCommands'
    | 'triggerHints'
    | 'quickHistoryAccess'
    | 'nonRedisEditor',
    Shortcut
  >
  rdi: Record<'openDedicatedEditor', Shortcut>
}

const isMac = isMacOs()

const CMD = <span className="cmdSymbol">⌘</span>
const SHIFT = <span className="shiftSymbol">⇧</span>
const ARROW_UP = <span className="badgeArrowUp">↑</span>
const ARROW_DOWN = <span className="badgeArrowDown">↓</span>

export const KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  _separator: isMac ? '' : '+',
  desktop: {
    newWindow: {
      descriptionKey: 'shortcuts.desktop.newWindow',
      keys: isMac ? [CMD, 'N'] : ['Ctrl', 'N'],
    },
    reloadPage: {
      descriptionKey: 'shortcuts.desktop.reloadPage',
      keys: isMac ? [CMD, 'R'] : ['Ctrl', 'R'],
    },
  },
  cli: {
    autocompleteNext: {
      descriptionKey: 'shortcuts.cli.autocompleteNext',
      keys: ['Tab'],
    },
    autocompletePrev: {
      descriptionKey: 'shortcuts.cli.autocompletePrev',
      keys: isMac ? [SHIFT, 'Tab'] : ['Shift', 'Tab'],
    },
    clearSearch: {
      descriptionKey: 'shortcuts.cli.clearSearch',
      keys: isMac ? [CMD, 'K'] : ['Ctrl', 'L'],
    },
    prevCommand: {
      descriptionKey: 'shortcuts.cli.prevCommand',
      keys: isMac ? [ARROW_UP] : ['Up Arrow'],
    },
    nextCommand: {
      descriptionKey: 'shortcuts.cli.nextCommand',
      keys: isMac ? [ARROW_DOWN] : ['Down Arrow'],
    },
  },
  workbench: {
    runQuery: {
      descriptionKey: 'shortcuts.workbench.runQuery',
      keys: isMac ? [CMD, 'Enter'] : ['Ctrl', 'Enter'],
    },
    nextLine: {
      descriptionKey: 'shortcuts.workbench.nextLine',
      keys: ['Enter'],
    },
    listOfCommands: {
      descriptionKey: 'shortcuts.workbench.listOfCommands',
      keys: isMac ? [CMD, 'Space'] : ['Ctrl', 'Space'],
    },
    triggerHints: {
      descriptionKey: 'shortcuts.workbench.triggerHints',
      keys: isMac ? [CMD, SHIFT, 'Space'] : ['Ctrl', 'Shift', 'Space'],
    },
    quickHistoryAccess: {
      descriptionKey: 'shortcuts.workbench.quickHistoryAccess',
      keys: ['Up Arrow'],
    },
    nonRedisEditor: {
      descriptionKey: 'shortcuts.workbench.nonRedisEditor',
      keys: isMac ? [SHIFT, 'Space'] : ['Shift', 'Space'],
    },
  },
  rdi: {
    openDedicatedEditor: {
      descriptionKey: 'shortcuts.rdi.openDedicatedEditor',
      keys: isMac ? [SHIFT, 'Space'] : ['Shift', 'Space'],
    },
  },
}
