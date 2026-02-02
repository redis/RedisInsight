import React, { useMemo, useRef, useEffect, useState } from 'react'
import JsxParser from 'react-jsx-parser'
import { debounce } from 'lodash'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { ChevronLeftIcon, RocketIcon } from 'uiSrc/components/base/icons'
import { HorizontalRule, LoadingContent } from 'uiSrc/components'
import { RiPopover } from 'uiSrc/components/base'
import { Link } from 'uiSrc/components/base/link/Link'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { getTutorialCapability, Nullable } from 'uiSrc/utils'

import { appContextCapability } from 'uiSrc/slices/app/context'
import {
  isShowCapabilityTutorialPopover,
  setCapabilityPopoverShown,
} from 'uiSrc/services'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import {
  Image,
  RedisUploadButton,
  CloudLink,
  RedisInsightLink,
} from 'uiSrc/components/markdown'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { getTutorialSection } from '../../utils'
import { EmptyPrompt, Pagination, Code } from '..'

import * as S from './InternalPage.styles'

export interface Props {
  onClose: () => void
  title: string
  backTitle: string
  content: string
  isLoading?: boolean
  error?: string
  scrollTop?: number
  onScroll?: (top: number) => void
  activeKey?: Nullable<string>
  path: string
  manifestPath?: Nullable<string>
  sourcePath: string
  pagination?: IEnablementAreaItem[]
}
const InternalPage = (props: Props) => {
  const location = useLocation()
  const {
    onClose,
    title,
    backTitle,
    isLoading,
    error,
    content,
    onScroll,
    scrollTop,
    pagination,
    activeKey,
    path,
    manifestPath,
    sourcePath,
  } = props
  const components: any = {
    Image,
    Code,
    RedisUploadButton,
    CloudLink,
    RedisInsightLink,
    Link,
  }
  const containerRef = useRef<HTMLDivElement>(null)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { source } = useSelector(appContextCapability)
  const { free = false } = useSelector(connectedInstanceCDSelector) ?? {}
  const [showCapabilityPopover, setShowCapabilityPopover] = useState(false)
  const tutorialCapability = getTutorialCapability(source!)

  const handleScroll = debounce(() => {
    if (containerRef.current && onScroll) {
      onScroll(containerRef.current.scrollTop)
    }
  }, 500)

  const sendEventClickExternalLinkTelemetry = (link: string = '') => {
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_LINK_CLICKED,
      eventData: {
        path,
        link,
        section: getTutorialSection(manifestPath),
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
      },
    })
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement

    // send telemetry event after click on an external link
    if (target?.getAttribute('href') && target?.getAttribute('target')) {
      sendEventClickExternalLinkTelemetry(target?.innerText)
    }
  }

  useEffect(() => {
    if (isShowCapabilityTutorialPopover(free) && !!tutorialCapability?.path) {
      setShowCapabilityPopover(true)
      setCapabilityPopoverShown()
      sendEventTelemetry({
        event: TelemetryEvent.CAPABILITY_POPOVER_DISPLAYED,
        eventData: {
          capabilityName: tutorialCapability.telemetryName,
          databaseId: instanceId,
        },
      })
    }
  }, [free])

  useEffect(() => {
    if (!isLoading && !error && containerRef.current) {
      if (location?.hash) {
        const target = containerRef.current?.querySelector(
          location.hash,
        ) as HTMLElement
        if (target) {
          // HACK: force scroll to element for electron app
          target.setAttribute('tabindex', '-1')
          target?.focus()
          return
        }
      }

      if (scrollTop && containerRef.current?.scrollTop === 0) {
        requestAnimationFrame(() =>
          setTimeout(() => {
            containerRef.current?.scroll(0, scrollTop)
          }, 0),
        )
      }
    }
  }, [isLoading, location])

  const contentComponent = useMemo(
    () => (
      // @ts-ignore
      <JsxParser
        bindings={{ path }}
        components={components}
        blacklistedTags={['iframe', 'script']}
        autoCloseVoidElements
        jsx={content}
        onError={(e) => console.error(e)}
      />
    ),
    [content],
  )

  return (
    <S.Container data-test-subj="internal-page">
      <S.Header>
        <div style={{ padding: 0 }}>
          <RiPopover
            panelClassName="popoverLikeTooltip"
            minWidth={S.POPOVER_MIN_WIDTH}
            anchorPosition="leftCenter"
            isOpen={showCapabilityPopover}
            panelPaddingSize="m"
            closePopover={() => setShowCapabilityPopover(false)}
            button={
              <S.PopoverAnchor>
                <S.BackButton>
                  <EmptyButton
                    data-testid="enablement-area__page-close"
                    icon={ChevronLeftIcon}
                    onClick={onClose}
                    aria-label="Back"
                  >
                    {backTitle}
                  </EmptyButton>
                </S.BackButton>
              </S.PopoverAnchor>
            }
          >
            <div data-testid="explore-capability-popover">
              <S.RocketIcon>
                <RocketIcon />
              </S.RocketIcon>
              <Text>
                <S.PopoverTitle>Explore Redis</S.PopoverTitle>
              </Text>
              <Text>
                <S.PopoverText>
                  {'You expressed interest in learning about the '}
                  <b>{tutorialCapability?.name}</b>. Try this tutorial to get
                  started.
                </S.PopoverText>
              </Text>
            </div>
          </RiPopover>
        </div>
        <div>
          <HorizontalRule margin="xs" />
        </div>
        <div>
          <Text color="default">
            <S.PageTitle>{title?.toUpperCase()}</S.PageTitle>
          </Text>
        </div>
      </S.Header>
      <S.Content
        ref={containerRef}
        className="jsx-markdown"
        onScroll={handleScroll}
        onClick={handleClick}
        role="none"
        data-testid="enablement-area__page"
      >
        {isLoading && (
          <LoadingContent
            data-testid="enablement-area__page-loader"
            lines={3}
          />
        )}
        {!isLoading && error && <EmptyPrompt />}
        {!isLoading && !error && contentComponent}
      </S.Content>
      {!!pagination?.length && (
        <>
          <S.Footer>
            <Pagination
              sourcePath={sourcePath}
              items={pagination}
              activePageKey={activeKey}
              compressed
            />
          </S.Footer>
        </>
      )}
    </S.Container>
  )
}

export default InternalPage
