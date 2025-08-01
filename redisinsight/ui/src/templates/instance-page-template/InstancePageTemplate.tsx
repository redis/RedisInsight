import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { theme } from '@redis-ui/styles'
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

export const firstPanelId = 'main-component'
export const secondPanelId = 'cli'

export interface Props {
  children: React.ReactNode
}

export const getDefaultSizes = () => {
  const storedSizes = localStorageService.get(
    BrowserStorageItem.cliResizableContainer,
  )

  return storedSizes && Array.isArray(storedSizes) ? storedSizes : [60, 40]
}

export const calculateMainPanelInitialSize = () => {
  const total = window.innerHeight
  const remaining = total - 26
  return Math.floor((remaining / total) * 100)
}

export const calculateBottomGroupPanelInitialSize = () => {
  const total = window.innerHeight
  return Math.ceil((26 / total) * 100)
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

  const sizeMain: number = calculateMainPanelInitialSize()
  const sizeBottomCollapsed: number = calculateBottomGroupPanelInitialSize()

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
      ref.current?.setLayout([sizeMain, sizeBottomCollapsed])
    }
  }, [isShowBottomGroup])

  const [actions, setActions] = useState<Nullable<React.ReactNode>>(null)

  return (
    <>
      <InstanceHeader />
      <AppNavigation actions={actions} onChange={() => setActions(null)} />
      <ResizableContainer
        ref={ref}
        direction="vertical"
        onLayout={onPanelWidthChange}
      >
        <ResizablePanel
          id={firstPanelId}
          minSize={7}
          defaultSize={isShowBottomGroup ? sizes[0] : sizeMain}
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
        <Spacer size="m" />
        <ResizablePanel
          id={secondPanelId}
          defaultSize={isShowBottomGroup ? sizes[1] : sizeBottomCollapsed}
          minSize={isShowBottomGroup ? 20 : 0}
          data-testid={secondPanelId}
          style={{
            borderTop: `1px solid ${theme.semantic.color.border.neutral500}`,
          }}
        >
          <BottomGroupComponents />
        </ResizablePanel>
      </ResizableContainer>
    </>
  )
}

export default InstancePageTemplate
