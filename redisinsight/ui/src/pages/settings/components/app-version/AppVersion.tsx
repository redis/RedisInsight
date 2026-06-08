import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { Text } from 'uiSrc/components/base/text'
import { getConfig } from 'uiSrc/config'

const BUILD_COMMIT_SHA_DISPLAY_LENGTH = 7

const AppVersion = () => {
  const server = useAppSelector(appServerInfoSelector)

  if (!server?.appVersion) return null

  const { showBuildCommitSha } = getConfig().app
  const buildCommitSha = showBuildCommitSha
    ? server.buildCommitSha?.slice(0, BUILD_COMMIT_SHA_DISPLAY_LENGTH)
    : undefined

  return (
    <Text
      size="s"
      color="secondary"
      data-testid="settings-app-version"
      style={{ marginTop: 16, textAlign: 'left' }}
    >
      Redis Insight v{server.appVersion}
      {buildCommitSha ? ` (${buildCommitSha})` : ''}
    </Text>
  )
}

export default AppVersion
