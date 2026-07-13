import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { Icon, KnowledgeBaseIcon } from 'uiSrc/components/base/icons'
import { EditorTab, EditorLibraryToggleProps } from './QueryEditor.types'
import { QueryOnboardingPopover } from './components/query-onboarding-popover'
import * as S from './QueryEditor.styles'

export const EditorLibraryToggle = ({
  activeTab,
  onChangeTab,
}: EditorLibraryToggleProps) => {
  const { t } = useTranslation()

  const tabs = [
    {
      value: EditorTab.Editor,
      label: t('vectorSearch.query.editor.tab.editor'),
    },
    {
      value: EditorTab.Library,
      label: t('vectorSearch.query.editor.tab.library'),
      icon: KnowledgeBaseIcon,
    },
  ]

  return (
    <S.ToggleBar data-testid="editor-library-toggle">
      <QueryOnboardingPopover>
        <ButtonGroup data-testid="editor-library-tabs">
          {tabs.map((tab) => (
            <ButtonGroup.Button
              key={tab.value}
              isSelected={activeTab === tab.value}
              onClick={() => onChangeTab(tab.value)}
              data-testid={`editor-library-tab-${tab.value}`}
            >
              {tab.icon && (
                <Icon icon={tab.icon} size="M" color="currentColor" />
              )}{' '}
              {tab.label}
            </ButtonGroup.Button>
          ))}
        </ButtonGroup>
      </QueryOnboardingPopover>
    </S.ToggleBar>
  )
}
