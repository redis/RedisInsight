import React from 'react'

import { EqualIcon, FoldersIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components/base'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { useTranslation } from 'uiSrc/i18n'

import { ISwitchType, ViewSwitchProps } from './ViewSwitch.types'
import * as S from './ViewSwitch.styles'

const ViewSwitch = ({
  viewType,
  isTreeViewDisabled = false,
  onChange,
}: ViewSwitchProps) => {
  const { t } = useTranslation()
  const viewTypes: ISwitchType[] = [
    {
      type: KeyViewType.Browser,
      tooltipText: t('browser.keysHeader.view.listTooltip'),
      ariaLabel: t('browser.keysHeader.view.listAria'),
      dataTestId: 'view-type-browser-btn',
      getIconType: () => EqualIcon,
    },
    {
      type: KeyViewType.Tree,
      tooltipText: isTreeViewDisabled
        ? t('browser.keysHeader.view.treeDisabledTooltip')
        : t('browser.keysHeader.view.treeTooltip'),
      ariaLabel: t('browser.keysHeader.view.treeAria'),
      dataTestId: 'view-type-list-btn',
      disabled: isTreeViewDisabled,
      getIconType: () => FoldersIcon,
    },
  ]

  return (
    <OnboardingTour options={ONBOARDING_FEATURES.BROWSER_TREE_VIEW}>
      <ButtonGroup data-testid="view-type-switcher">
        {viewTypes.map((view) => (
          <RiTooltip
            content={view.tooltipText}
            position="top"
            key={view.tooltipText}
          >
            <S.SwitchButton
              aria-label={view.ariaLabel}
              onClick={() => onChange(view.type)}
              isSelected={viewType === view.type}
              data-testid={view.dataTestId}
              disabled={view.disabled || false}
            >
              <ButtonGroup.Icon icon={view.getIconType()} />
            </S.SwitchButton>
          </RiTooltip>
        ))}
      </ButtonGroup>
    </OnboardingTour>
  )
}

export default React.memo(ViewSwitch)
