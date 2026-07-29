import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import cx from 'classnames'
import { debounce } from 'lodash'
import { useLocation, useParams } from 'react-router-dom'
import { useAppSelector } from 'uiSrc/slices/hooks'

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
import {
  MarkdownRenderer,
  MarkdownLeafComponents,
} from 'uiSrc/components/markdown/MarkdownRenderer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { getTutorialSection } from '../../utils'
import { EmptyPrompt, Pagination, Code } from '..'

import styles from './styles.module.scss'

// External link leaf rendered for absolute-path markdown links. Defined at
// module scope (not per render) so its function identity is stable across
// re-renders and react-markdown doesn't remount the link's DOM node on every
// scroll/popover update. The base Link already adds target/rel on its own.
const TutorialExternalLink = ({
  href,
  children,
}: {
  href: string
  children?: ReactNode
}) => (
  <Link external variant="inline" size="S" href={href}>
    {children}
  </Link>
)

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
  // Defined per render (not at module scope) because Code is re-exported
  // through the components barrel that InternalPage itself is part of;
  // capturing it at module-eval time would see it as undefined mid-cycle.
  // Memoized with no deps: every value below is a stable module-level
  // import, so the object identity stays stable across re-renders and
  // MarkdownRenderer/ReactMarkdown don't re-render the whole tutorial tree.
  const markdownComponents: Partial<MarkdownLeafComponents> = useMemo(
    () => ({
      RedisCode: Code,
      RedisUpload: RedisUploadButton,
      ExternalLink: TutorialExternalLink,
      CloudLink,
      RedisInsightLink,
      Image,
    }),
    [],
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { source } = useAppSelector(appContextCapability)
  const { free = false } = useAppSelector(connectedInstanceCDSelector) ?? {}
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

  return (
    <div className={styles.container} data-test-subj="internal-page">
      <div className={styles.header}>
        <div style={{ padding: 0 }}>
          <RiPopover
            panelClassName={cx('popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            anchorPosition="leftCenter"
            isOpen={showCapabilityPopover}
            panelPaddingSize="m"
            closePopover={() => setShowCapabilityPopover(false)}
            button={
              <div className={styles.backButton}>
                <EmptyButton
                  data-testid="enablement-area__page-close"
                  icon={ChevronLeftIcon}
                  onClick={onClose}
                  aria-label="Back"
                >
                  {backTitle}
                </EmptyButton>
              </div>
            }
          >
            <div data-testid="explore-capability-popover">
              <RocketIcon className={styles.rocketIcon} />
              <Text className={styles.popoverTitle}>Explore Redis</Text>
              <Text className={styles.popoverText}>
                {'You expressed interest in learning about the '}
                <b>{tutorialCapability?.name}</b>. Try this tutorial to get
                started.
              </Text>
            </div>
          </RiPopover>
        </div>
        <div>
          <HorizontalRule margin="xs" />
        </div>
        <div>
          <Text className={styles.pageTitle} color="default">
            {title?.toUpperCase()}
          </Text>
        </div>
      </div>
      <div
        ref={containerRef}
        className={cx(styles.content, 'jsx-markdown')}
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
        {!isLoading && !error && (
          <MarkdownRenderer path={path} components={markdownComponents}>
            {content ?? ''}
          </MarkdownRenderer>
        )}
      </div>
      {!!pagination?.length && (
        <>
          <div className={styles.footer}>
            <Pagination
              sourcePath={sourcePath}
              items={pagination}
              activePageKey={activeKey}
              compressed
            />
          </div>
        </>
      )}
    </div>
  )
}

export default InternalPage
