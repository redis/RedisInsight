import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { Text } from 'uiSrc/components/base/text'

const AppVersion = () => {
  const server = useAppSelector(appServerInfoSelector)

  if (!server?.appVersion) return null

  return (
    <Text
      size="s"
      color="secondary"
      data-testid="settings-app-version"
      style={{ marginTop: 16, textAlign: 'left' }}
    >
      Redis Insight v{server.appVersion}
    </Text>
  )
}

export default AppVersion
