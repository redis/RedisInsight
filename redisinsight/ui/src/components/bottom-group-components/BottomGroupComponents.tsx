import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import CliWrapper from 'uiSrc/components/cli/CliWrapper'
import CommandHelperWrapper from 'uiSrc/components/command-helper/CommandHelperWrapper'
import { MonitorWrapper } from 'uiSrc/components'
import { monitorSelector } from 'uiSrc/slices/cli/monitor'
import BottomGroupMinimized from './components/bottom-group-minimized/BottomGroupMinimized'

import * as S from './BottomGroupComponents.styles'

const GroupComponentsWrapper = styled.div`
  height: 100%;
  padding: 0 16px;
`

const GroupComponents = styled.div`
  display: flex;
  flex-grow: 1;
  height: calc(100% - 26px);
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

const BottomGroupComponents = () => {
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { isShowMonitor } = useSelector(monitorSelector)

  return (
    <GroupComponentsWrapper>
      <GroupComponents>
        {isShowCli && <CliWrapper />}
        {isShowHelper && (
          <S.HelperWrapper $fullWidth={!isShowCli}>
            <CommandHelperWrapper />
          </S.HelperWrapper>
        )}
        {isShowMonitor && (
          <S.MonitorWrapper $fullWidth={!isShowCli}>
            <MonitorWrapper />
          </S.MonitorWrapper>
        )}
      </GroupComponents>
      <BottomGroupMinimized />
    </GroupComponentsWrapper>
  )
}

export default BottomGroupComponents
