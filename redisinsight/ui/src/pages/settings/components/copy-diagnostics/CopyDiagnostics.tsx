import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { CopyButton } from 'uiSrc/components/copy-button'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'

import { formatDiagnostics } from './formatDiagnostics'

export const CopyDiagnostics = () => {
  const { t } = useTranslation()
  const server = useAppSelector(appServerInfoSelector)

  if (!server?.appVersion) return null

  const label = t('settings.copyDiagnostics')

  return (
    <Row
      align="center"
      gap="s"
      grow={false}
      data-testid="settings-copy-diagnostics"
    >
      <Text size="s" color="secondary">
        {label}
      </Text>
      <CopyButton
        copy={formatDiagnostics(server)}
        withTooltip={false}
        aria-label={label}
        data-testid="copy-diagnostics"
      />
    </Row>
  )
}
