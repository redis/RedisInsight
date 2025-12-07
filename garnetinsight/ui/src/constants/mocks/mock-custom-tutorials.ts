import {
  EnablementAreaComponent,
  IEnablementAreaItem,
} from 'uiSrc/slices/interfaces'

export const MOCK_CUSTOM_TUTORIALS_ITEMS: IEnablementAreaItem[] = [
  {
    id: 'custom-tutorials',
    label: 'MY TUTORIALS',
    type: EnablementAreaComponent.Group,
    _actions: ['create'],
    args: {
      initialIsOpen: true,
    },
    children: [
      {
        id: '12mfp-rem',
        label: 'My guide',
        type: EnablementAreaComponent.Group,
        _path: '/do21-d',
        _actions: ['delete'],
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
        ],
      },
    ],
  },
]

export const MOCK_CUSTOM_TUTORIALS = {
  id: 'custom-tutorials',
  label: 'MY TUTORIALS',
  type: EnablementAreaComponent.Group,
  _actions: ['create'],
  children: MOCK_CUSTOM_TUTORIALS_ITEMS,
}
