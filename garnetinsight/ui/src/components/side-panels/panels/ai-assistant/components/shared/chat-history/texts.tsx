import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export const AssistanceChatInitialMessage = (
  <>
    <Text size="xs">Hi!</Text>
    <Text size="xs">
      Feel free to engage in a general conversation with me about Redis.
    </Text>
    <Text size="xs">
      Or switch to <b>My Data</b> tab to get assistance in the context of your
      data.
    </Text>
    <Text size="xs">
      Type <b>/help</b> for more info.
    </Text>
    <Spacer />
    <Text size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </Text>
  </>
)
