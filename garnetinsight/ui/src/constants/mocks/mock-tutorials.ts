import {
  EnablementAreaComponent,
  IEnablementAreaItem,
} from 'uiSrc/slices/interfaces'

export const MOCK_TUTORIALS_ITEMS: IEnablementAreaItem[] = [
  {
    type: EnablementAreaComponent.Group,
    id: 'tutorials',
    label: 'Tutorials',
    children: [
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'document-capabilities',
        label: 'Document Capabilities',
        args: {
          path: '/static/workbench/quick-guides/document/learn-more.md',
        },
      },
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-json',
        label: 'Working with JSON',
        args: {
          path: 'quick-guides/working-with-json.html',
        },
      },
      {
        type: EnablementAreaComponent.InternalLink,
        id: 'working-with-hash',
        label: 'Working with HASH',
        args: {
          path: 'quick-guides/working-with-hash.html',
        },
      },
    ],
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'internal-page',
    label: 'Internal Page',
    args: {
      path: 'quick-guides/document-capabilities.html',
    },
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'second-internal-page',
    label: 'Second Internal Page',
    args: {
      path: 'quick-guides/document-capabilities.html',
    },
  },
  {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      path: '_scripts/manual.txt',
    },
  },
  {
    type: EnablementAreaComponent.InternalLink,
    id: 'working_with_json',
    label: 'Working with JSON',
    args: {
      path: '/redis_stack/working_with_json.md',
    },
  },
]

export const MOCK_TUTORIALS = {
  type: EnablementAreaComponent.Group,
  id: 'quick-guides',
  label: 'Quick Guides',
  children: MOCK_TUTORIALS_ITEMS,
}
