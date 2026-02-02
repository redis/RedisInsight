import React, { useState } from 'react'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
} from 'uiSrc/slices/panels/sidePanels'
import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/shared'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { EraserIcon, LightBulbIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import * as S from './ExpertChatHeader.styles'

export interface Props {
  connectedInstanceName?: string
  databaseId: string
  isClearDisabled?: boolean
  onRestart: () => void
}

const ExpertChatHeader = (props: Props) => {
  const { databaseId, connectedInstanceName, isClearDisabled, onRestart } =
    props
  const [isTutorialsPopoverOpen, setIsTutorialsPopoverOpen] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleOpenTutorials = () => {
    setIsTutorialsPopoverOpen(false)

    dispatch(resetExplorePanelSearch())
    dispatch(setExplorePanelIsPageOpen(false))
    history.push({ search: '' })

    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: databaseId || TELEMETRY_EMPTY_VALUE,
        source: 'chatbot_tutorials_button',
      },
    })
  }

  return (
    <S.Header>
      {connectedInstanceName ? (
        <RiTooltip content={connectedInstanceName}>
          <S.DbName>
            <Text size="xs" className="truncateText">
              {connectedInstanceName}
            </Text>
          </S.DbName>
        </RiTooltip>
      ) : (
        <span />
      )}
      <S.HeaderActions>
        <RiTooltip
          content={
            isTutorialsPopoverOpen
              ? undefined
              : 'Open relevant tutorials to learn more'
          }
          position="bottom"
        >
          <S.HeaderBtnAnchor>
            <RiPopover
              ownFocus
              panelClassName="popoverLikeTooltip"
              minWidth={S.POPOVER_MIN_WIDTH}
              anchorPosition="downLeft"
              isOpen={isTutorialsPopoverOpen}
              panelPaddingSize="m"
              closePopover={() => setIsTutorialsPopoverOpen(false)}
              button={
                <S.PopoverAnchor>
                  <S.HeaderBtn>
                    <EmptyButton
                      icon={LightBulbIcon}
                      size="small"
                      onClick={() => setIsTutorialsPopoverOpen(true)}
                      data-testid="ai-expert-tutorial-btn"
                    />
                  </S.HeaderBtn>
                </S.PopoverAnchor>
              }
            >
              <>
                <Text size="m" color="primary">
                  Open relevant tutorials to learn more about search and query.
                </Text>
                <Spacer size="l" />
                <Row justify="end">
                  <S.OpenTutorialsBtn>
                    <PrimaryButton
                      size="s"
                      onClick={handleOpenTutorials}
                      data-testid="ai-expert-open-tutorials"
                    >
                      Open tutorials
                    </PrimaryButton>
                  </S.OpenTutorialsBtn>
                </Row>
              </>
            </RiPopover>
          </S.HeaderBtnAnchor>
        </RiTooltip>
        <RestartChat
          button={
            <S.HeaderBtn>
              <EmptyButton
                disabled={isClearDisabled}
                icon={EraserIcon}
                size="small"
                data-testid="ai-expert-restart-session-btn"
              />
            </S.HeaderBtn>
          }
          onConfirm={onRestart}
        />
      </S.HeaderActions>
    </S.Header>
  )
}

export default ExpertChatHeader
