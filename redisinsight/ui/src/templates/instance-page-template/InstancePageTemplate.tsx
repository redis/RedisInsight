import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import InstanceHeader from 'uiSrc/components/instance-header'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import BottomGroupComponents from 'uiSrc/components/bottom-group-components/BottomGroupComponents'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { monitorSelector } from 'uiSrc/slices/cli/monitor'

import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
  Spacer,
} from 'uiSrc/components/base/layout'
import { ImperativePanelGroupHandle } from 'uiSrc/components/base/layout/resize'
import { AppNavigation } from 'uiSrc/components'
import { AppNavigationActionsProvider } from 'uiSrc/contexts/AppNavigationActionsProvider'
import { Nullable } from 'uiSrc/utils'
import { useNavigation } from 'uiSrc/components/navigation-menu/hooks/useNavigation'

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

export interface Props {
  children: React.ReactNode
}

const ButtonGroupResizablePanel = styled(ResizablePanel)`
  flex-basis: 27px !important;
`

export const getDefaultSizes = () => {
  const storedSizes = localStorageService.get(
    BrowserStorageItem.cliResizableContainer,
  )

  return storedSizes && Array.isArray(storedSizes) ? storedSizes : [60, 40]
}

const roundUpSizes = (sizes: number[]) => [
  Math.floor(sizes[0]),
  Math.ceil(sizes[1]),
]

const InstancePageTemplate = (props: Props) => {
  const { children } = props
  const [sizes, setSizes] = useState<number[]>(getDefaultSizes())

  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)
  const { isShowMonitor } = useSelector(monitorSelector)
  const { privateRoutes } = useNavigation()

  const ref = useRef<ImperativePanelGroupHandle>(null)

  useEffect(
    () => () => {
      setSizes((prevSizes: number[]) => {
        const roundedSizes = roundUpSizes(prevSizes)
        localStorageService.set(
          BrowserStorageItem.cliResizableContainer,
          roundedSizes,
        )
        return roundedSizes
      })
    },
    [],
  )

  const isShowBottomGroup = isShowCli || isShowHelper || isShowMonitor

  const onPanelWidthChange = useCallback(
    (newSizes: any) => {
      if (isShowBottomGroup) {
        setSizes(roundUpSizes(newSizes))
      }
    },
    [isShowBottomGroup],
  )

  useEffect(() => {
    if (isShowBottomGroup) {
      ref.current?.setLayout(roundUpSizes(sizes))
    } else {
      ref.current?.setLayout([100, 0])
    }
  }, [isShowBottomGroup])

  const [actions, setActions] = useState<Nullable<React.ReactNode>>(null)

  return (
    <>
      <InstanceHeader />
      <AppNavigation
        actions={actions}
        onChange={() => setActions(null)}
        routes={privateRoutes}
      />
      <Spacer size="m" />
      <ResizableContainer
        ref={ref}
        direction="vertical"
        onLayout={onPanelWidthChange}
      >
        <ResizablePanel
          id={firstPanelId}
          minSize={7}
          defaultSize={isShowBottomGroup ? sizes[0] : 100}
          data-testid={firstPanelId}
        >
          <AppNavigationActionsProvider
            value={{
              actions,
              setActions,
            }}
          >
            <ExplorePanelTemplate>{children}</ExplorePanelTemplate>
          </AppNavigationActionsProvider>
        </ResizablePanel>
        <ResizablePanelHandle
          direction="horizontal"
          id="resize-btn-browser-cli"
          data-testid="resize-btn-browser-cli"
          style={{ display: isShowBottomGroup ? 'inherit' : 'none' }}
        />
        {!isShowBottomGroup && <Spacer size="l" />}
        <ButtonGroupResizablePanel
          id={secondPanelId}
          defaultSize={isShowBottomGroup ? sizes[1] : 0}
          minSize={isShowBottomGroup ? 20 : 0}
          data-testid={secondPanelId}
        >
          <BottomGroupComponents />
        </ButtonGroupResizablePanel>
      </ResizableContainer>
    </>
  )
}

export default InstancePageTemplate
