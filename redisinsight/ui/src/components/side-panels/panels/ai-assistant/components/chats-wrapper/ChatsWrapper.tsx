import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { filter } from 'lodash'
import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'

import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Maybe } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import AssistanceChat from '../assistance-chat'
import ExpertChat from '../expert-chat'
import * as S from '../../../../SidePanels.styles'

interface ChatWithTabs {
  feature: Maybe<FeatureFlagComponent>
  tab: AiChatType
}

const ChatsWrapper = () => {
  const { activeTab } = useSelector(aiChatSelector)
  const {
    [FeatureFlags.documentationChat]: documentationChatFeature,
    [FeatureFlags.databaseChat]: databaseChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const chats = filter<ChatWithTabs>(
    [
      {
        feature: documentationChatFeature,
        tab: AiChatType.Assistance,
      },
      {
        feature: databaseChatFeature,
        tab: AiChatType.Query,
      },
    ],
    ({ feature }) => !!feature?.flag,
  )

  const dispatch = useDispatch()

  useEffect(() => {
    if (!chats.length) return

    if (
      (activeTab === AiChatType.Assistance &&
        !documentationChatFeature?.flag) ||
      (activeTab === AiChatType.Query && !databaseChatFeature?.flag)
    ) {
      dispatch(setSelectedTab(chats[0].tab))
    }

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        chat: activeTab,
      },
    })
  }, [databaseChatFeature, databaseChatFeature, activeTab])

  const tabs: TabInfo[] = [
    {
      label: <span>General</span>,
      value: AiChatType.Assistance,
      content: null,
    },
    {
      label: <span>My Data</span>,
      value: AiChatType.Query,
      content: null,
    },
  ].filter(
    (tab) =>
      (tab.value === AiChatType.Assistance && documentationChatFeature?.flag) ||
      (tab.value === AiChatType.Query && databaseChatFeature?.flag),
  )

  const selectTab = (tab: string) => {
    dispatch(setSelectedTab(tab as AiChatType))
  }

  return (
    <S.ChatsWrapperContainer data-testid="chat-wrapper">
      {chats.length > 1 && (
        <S.Tabs
          as={Tabs}
          tabs={tabs}
          value={activeTab}
          onChange={selectTab}
          data-testid="ai-tabs"
        />
      )}
      {chats.length > 0 && (
        <S.Chat>
          {activeTab === AiChatType.Assistance &&
            documentationChatFeature?.flag && <AssistanceChat />}
          {activeTab === AiChatType.Query && databaseChatFeature?.flag && (
            <ExpertChat />
          )}
        </S.Chat>
      )}
    </S.ChatsWrapperContainer>
  )
}

export default ChatsWrapper
