import React from 'react'

import { Text } from 'uiSrc/components/base/text/Text'

const EnvironmentTooltipContent = () => (
  <>
    <Text>Classify this database to apply the right safety behavior.</Text>
    <Text>
      <strong>Production</strong> — Adds an extra layer of protection to prevent
      unintended changes. Includes additional confirmation dialogs before
      modifying data and stronger friction before running dangerous commands.
    </Text>
    <Text>
      <strong>Development</strong> — Skips standard confirmation dialogs when
      modifying data, for faster work on development and test databases.
    </Text>
    <Text>
      <strong>Unspecified</strong> — Standard Redis Insight behavior. The
      default for new and existing connections.
    </Text>
  </>
)

export default EnvironmentTooltipContent
