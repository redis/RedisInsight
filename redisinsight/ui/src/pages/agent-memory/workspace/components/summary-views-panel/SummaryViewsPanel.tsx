import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  agentMemorySummarySelector,
  createDefaultSummaryViewsAction,
  fetchSummariesAction,
  deleteSummaryViewAction,
  runSummaryPartitionAction,
  runSummaryViewAction,
} from 'uiSrc/slices/agentMemory/workspace'
import { Nullable } from 'uiSrc/utils'
import {
  DEFAULT_SUMMARY_GROUPINGS,
  SummaryView,
  SummaryViewPartition,
} from 'uiSrc/slices/interfaces/agentMemory'

import { pluralize, relativeTime } from '../../utils/format'
import PaneAutoRefresh from '../pane-auto-refresh/PaneAutoRefresh'
import TimestampWithRelative from '../timestamp-with-relative/TimestampWithRelative'
import HoverCopyButton from '../hover-copy-button/HoverCopyButton'
import * as S from './SummaryViewsPanel.styles'

export interface SummaryViewsPanelProps {
  endpointId: string
}

const DELETE_SUFFIX = '_delete_view'

const groupKeyLabel = (key: string) =>
  key
    .split('_')
    .map((word) =>
      word === 'id' ? 'ID' : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')

/** Titled by what the view groups on; the stored name is just a label. */
const viewDisplayName = (view: SummaryView) =>
  view.groupBy.length
    ? `By ${view.groupBy.map(groupKeyLabel).join(', ')}`
    : view.name

interface SummaryCardProps {
  label: string
  groupValue?: string
  groupTitle: string
  partition: Nullable<SummaryViewPartition>
  group: Record<string, string>
  viewId: string
  endpointId: string
  loading: boolean
  testId: string
}

/** One LLM-computed profile card. */
const SummaryCard = ({
  label,
  groupValue,
  groupTitle,
  partition,
  group,
  viewId,
  endpointId,
  loading,
  testId,
}: SummaryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  const summaryText = partition?.summary

  // Show the toggle only when the collapsed text is actually truncated.
  useEffect(() => {
    const el = textRef.current
    if (!el || !summaryText) {
      setIsClamped(false)
      return undefined
    }
    const frame = requestAnimationFrame(() => {
      if (!isExpanded) {
        setIsClamped(el.scrollHeight > el.clientHeight + 1)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [summaryText, isExpanded])

  const count = partition?.memory_count
  const computedAt = partition?.computed_at

  return (
    <S.SummaryCard $empty={!summaryText} data-testid={testId}>
      <S.CardMeta>
        <S.SummaryScopeBadge>{label}</S.SummaryScopeBadge>
        {computedAt && (
          <TimestampWithRelative
            dateTime={computedAt}
            content={`computed ${relativeTime(computedAt)}`}
            data-testid={`${testId}-computed-at`}
          />
        )}
        <S.SummaryHeaderMeta>
          {typeof count === 'number' &&
            `from ${pluralize(count, 'memory', 'memories')}`}
        </S.SummaryHeaderMeta>
      </S.CardMeta>
      <S.SummaryBannerText ref={textRef} $expanded={isExpanded}>
        {summaryText || 'No summary yet. Click ↻ to generate one.'}
      </S.SummaryBannerText>
      {(isClamped || isExpanded) && !!summaryText && (
        <S.SummaryBannerToggle
          type="button"
          aria-expanded={isExpanded}
          data-testid={`${testId}-toggle`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </S.SummaryBannerToggle>
      )}
      <S.CardFooter>
        <S.CardMetaSession>
          <S.VisuallyHidden>{groupTitle}:</S.VisuallyHidden>
          {groupValue && (
            <RiTooltip
              title={groupTitle}
              position="bottom"
              content={groupValue}
            >
              <code data-testid={`${testId}-group-id`}>{groupValue}</code>
            </RiTooltip>
          )}
          {groupValue && (
            <HoverCopyButton
              copy={groupValue}
              label={`Copy ${groupTitle}`}
              testId={`${testId}-copy-group-id`}
            />
          )}
        </S.CardMetaSession>
        <S.SummaryBannerRefresh
          type="button"
          aria-label={`Recompute ${label} summary`}
          disabled={loading}
          data-testid={`${testId}-refresh`}
          onClick={() =>
            dispatch(runSummaryPartitionAction(endpointId, viewId, group))
          }
        >
          <RiIcon type="ResetIcon" size="m" />
        </S.SummaryBannerRefresh>
      </S.CardFooter>
    </S.SummaryCard>
  )
}

interface SummaryViewSectionProps {
  view: SummaryView
  partitions: SummaryViewPartition[]
  endpointId: string
  loading: boolean
  isRunning: boolean
  deleting: string
  setDeleting: (value: string) => void
}

/** One view as a native <details> disclosure with an overlaid controls row. */
const SummaryViewSection = ({
  view,
  partitions,
  endpointId,
  loading,
  isRunning,
  deleting,
  setDeleting,
}: SummaryViewSectionProps) => {
  const [isOpen, setIsOpen] = useState(true)

  const displayName = viewDisplayName(view)
  const groupTitle = view.groupBy.map(groupKeyLabel).join(', ')
  const cardLabel = view.groupBy
    .map((key) => key.replace(/_id$/, ''))
    .join(' · ')

  // Newest first - the freshest conversations are the ones being debugged.
  const orderedPartitions = useMemo(
    () =>
      [...partitions].sort(
        (a, b) =>
          new Date(b.computed_at ?? 0).getTime() -
          new Date(a.computed_at ?? 0).getTime(),
      ),
    [partitions],
  )

  return (
    <S.SummaryViewSection open={isOpen} data-testid={`summary-view-${view.id}`}>
      <S.SummaryViewHeader
        data-testid={`summary-view-${view.id}-toggle`}
        onClick={(event) => {
          event.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        <RiIcon
          type={isOpen ? 'ChevronDownIcon' : 'ChevronRightIcon'}
          size="m"
        />
        <S.SummaryViewName>{displayName}</S.SummaryViewName>
        <S.SummaryViewCount>
          {pluralize(orderedPartitions.length, 'summary', 'summaries')}
        </S.SummaryViewCount>
      </S.SummaryViewHeader>
      <S.SummaryViewControls>
        <RiTooltip title="View Id" position="bottom" content={view.id}>
          <S.SummaryViewBadge>{view.name}</S.SummaryViewBadge>
        </RiTooltip>
        {!orderedPartitions.length && (
          <S.SummaryBannerRefresh
            type="button"
            aria-label={`Compute all ${displayName} summaries`}
            disabled={loading || isRunning}
            data-testid={`summary-view-${view.id}-run`}
            onClick={() => dispatch(runSummaryViewAction(endpointId, view.id))}
          >
            <RiIcon type="ResetIcon" size="m" />
          </S.SummaryBannerRefresh>
        )}
        <PopoverDelete
          header={displayName}
          text="The view configuration will be deleted and its summaries will no longer be computed or listed. Already-computed summaries remain stored on the server."
          item={view.id}
          suffix={DELETE_SUFFIX}
          deleting={deleting}
          updateLoading={loading}
          closePopover={() => setDeleting('')}
          showPopover={(item) => setDeleting(`${item}${DELETE_SUFFIX}`)}
          testid={`summary-view-${view.id}-delete`}
          handleDeleteItem={() => {
            setDeleting('')
            dispatch(deleteSummaryViewAction(endpointId, view.id))
          }}
        />
      </S.SummaryViewControls>
      <S.SummaryCardList>
        {orderedPartitions.map((partition) => {
          const groupValue = Object.values(partition.group ?? {}).join(' · ')
          return (
            <li key={`${view.id}-${JSON.stringify(partition.group ?? {})}`}>
              <SummaryCard
                label={cardLabel}
                groupValue={groupValue}
                groupTitle={groupTitle}
                partition={partition}
                group={partition.group ?? {}}
                viewId={view.id}
                endpointId={endpointId}
                loading={loading}
                testId={`summary-${view.id}-${groupValue}`}
              />
            </li>
          )
        })}
        {!orderedPartitions.length && (
          <li>
            <S.EmptyListText data-testid={`summary-view-${view.id}-empty`}>
              No summaries yet. Click ↻ above to compute them.
            </S.EmptyListText>
          </li>
        )}
      </S.SummaryCardList>
    </S.SummaryViewSection>
  )
}

const hasGrouping = (views: SummaryView[], groupBy: string[]) =>
  views.some(
    (view) =>
      view.groupBy.length === groupBy.length &&
      groupBy.every((key) => view.groupBy.includes(key)),
  )

/** LLM-computed profiles grouped per summary view; not affected by records filters. */
const SummaryViewsPanel = ({ endpointId }: SummaryViewsPanelProps) => {
  const { views, partitions, loading, runningViewIds, lastRefreshTime } =
    useAppSelector(agentMemorySummarySelector)
  const [deleting, setDeleting] = useState('')

  if (!views) return null

  const isMissingDefaults = DEFAULT_SUMMARY_GROUPINGS.some(
    (groupBy) => !hasGrouping(views, groupBy),
  )

  return (
    <S.Pane data-testid="summary-views-panel">
      <S.PaneHeaderBlock>
        <S.PaneHeader align="center" justify="between">
          <S.PaneTitle align="center" gap="m">
            <h2>Summary views</h2>
          </S.PaneTitle>
          <S.PaneHeaderRight align="center">
            <PaneAutoRefresh
              postfix="agent-memory-summaries"
              loading={loading}
              lastRefreshTime={lastRefreshTime}
              onRefresh={() => dispatch(fetchSummariesAction(endpointId))}
              testid="summaries"
            />
            {!!views.length && isMissingDefaults && (
              <SecondaryButton
                size="small"
                disabled={loading}
                data-testid="summary-views-create-defaults"
                onClick={() =>
                  dispatch(createDefaultSummaryViewsAction(endpointId))
                }
              >
                ＋ Default views
              </SecondaryButton>
            )}
          </S.PaneHeaderRight>
        </S.PaneHeader>
      </S.PaneHeaderBlock>
      {views.length ? (
        <S.SummaryViewsList>
          {views.map((view) => (
            <SummaryViewSection
              key={view.id}
              view={view}
              partitions={partitions[view.id] ?? []}
              endpointId={endpointId}
              loading={loading}
              isRunning={runningViewIds.includes(view.id)}
              deleting={deleting}
              setDeleting={setDeleting}
            />
          ))}
        </S.SummaryViewsList>
      ) : (
        <S.SummaryEmptyState align="center" gap="l">
          <S.EmptyListText data-testid="summary-views-empty">
            No summary views configured.
          </S.EmptyListText>
          <SecondaryButton
            size="small"
            disabled={loading}
            data-testid="summary-views-create-defaults"
            onClick={() =>
              dispatch(createDefaultSummaryViewsAction(endpointId))
            }
          >
            Create default views
          </SecondaryButton>
        </S.SummaryEmptyState>
      )}
    </S.Pane>
  )
}

export default SummaryViewsPanel
