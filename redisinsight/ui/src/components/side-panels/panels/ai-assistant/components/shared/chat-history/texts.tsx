import React from 'react'

import { RiText } from 'uiSrc/components/base/text'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'

export const AssistanceChatInitialMessage = (
  <>
    <RiText size="xs">Hi!</RiText>
    <RiText size="xs">
      Feel free to engage in a general conversation with me about Redis.
    </RiText>
    <RiText size="xs">
      Or switch to <b>My Data</b> tab to get assistance in the context of your
      data.
    </RiText>
    <RiText size="xs">
      Type <b>/help</b> for more info.
    </RiText>
    <RiSpacer />
    <RiText size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </RiText>
  </>
)
