import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailsHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  Ref,
} from 'react'
import styled from 'styled-components'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { ResizableContainer } from 'uiSrc/components/base/layout'
import { Theme } from 'uiSrc/components/base/theme/types'
import SearchInput from 'uiSrc/components/base/inputs/SearchInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

/**
 * Inspector palette exposed as `--ami-*` CSS variables on the page root.
 * Surfaces, text and borders come from the app theme's semantic tokens so
 * the screen matches every other RedisInsight screen in both themes; only
 * the accent colors (role tags, chips, type badges) are lifted from the
 * redis-agent-memory-inspector Chrome extension, with its dark-mode
 * variants applied when the app theme is dark.
 */
const staticAccents = {
  accent: '#dcff1c',
  dark: '#2d4754',
}

const lightAccents = {
  roleAccent: '#0a6e9c',
  roleAccentBg: 'rgba(127, 219, 254, 0.18)',
  chipTopicBg: 'rgba(199, 150, 228, 0.18)',
  chipTopicText: '#6a3aa0',
  chipEntityBg: '#e8ebec',
  chipEntityText: '#163341',
  paneHeaderBorder: '#e8ebec',
  typeMessageBg: 'rgba(45, 71, 84, 0.1)',
  typeMessageText: '#2d4754',
  semanticBadgeBg: 'rgba(255, 68, 56, 0.12)',
  dangerHoverBg: 'rgba(244, 67, 54, 0.1)',
  iconFilter: 'none',
}

const darkAccents: typeof lightAccents = {
  roleAccent: '#7fdbfe',
  roleAccentBg: 'rgba(127, 219, 254, 0.18)',
  chipTopicBg: 'rgba(199, 150, 228, 0.22)',
  chipTopicText: '#d4b3f0',
  chipEntityBg: 'var(--ami-bgTertiary)',
  chipEntityText: 'var(--ami-text)',
  paneHeaderBorder: 'var(--ami-bgTertiary)',
  typeMessageBg: 'rgba(245, 247, 250, 0.08)',
  typeMessageText: 'var(--ami-textSecondary)',
  semanticBadgeBg: 'rgba(255, 68, 56, 0.2)',
  dangerHoverBg: 'rgba(244, 67, 54, 0.22)',
  iconFilter: 'invert(1) hue-rotate(180deg)',
}

/* Legacy EUI variables kept for visual parity with the screens that
 * still use them; no semantic token has the same values. */
const legacyThemeVars = {
  separator: 'var(--separatorColorLight)',
  surveyHoverBg: 'var(--euiColorSecondary)',
  surveyHoverText: 'var(--euiColorPrimaryText)',
}

const PALETTE_KEYS = [
  ...Object.keys(staticAccents),
  ...Object.keys(lightAccents),
  ...Object.keys(legacyThemeVars),
  'text',
  'textSecondary',
  'textMuted',
  'dangerText',
  'successText',
  'bgPrimary',
  'bgSecondary',
  'bgTertiary',
  'border',
  'borderStrong',
] as const

/* `--ami-<key>` variables usable in any descendant, including css built
 * inside prop functions */
export const palette = Object.fromEntries(
  PALETTE_KEYS.map((key) => [key, `var(--ami-${key})`]),
) as Record<(typeof PALETTE_KEYS)[number], string>

const paletteVars = ({ theme }: { theme: Theme }) => {
  const isDark = (theme as { name?: string })?.name === 'dark'
  const color = theme?.semantic?.color
  const values: Record<string, string> = {
    ...staticAccents,
    ...(isDark ? darkAccents : lightAccents),
    ...legacyThemeVars,
    text: color?.text?.neutral800,
    textSecondary: color?.text?.neutral700,
    /* neutral600 fails WCAG AA contrast in both themes */
    textMuted: color?.text?.neutral700,
    dangerText: color?.text?.danger600,
    successText: color?.text?.success600,
    bgPrimary: color?.background?.neutral100,
    bgSecondary: color?.background?.neutral200,
    /* dark neutral300 is pure black - darker than the cards it sits on,
     * so pills/chips using it vanish; neutral400 (#3a3a3a) reads clearly */
    bgTertiary: isDark
      ? color?.background?.neutral400
      : color?.background?.neutral300,
    border: color?.border?.neutral500,
    borderStrong: color?.border?.neutral600,
  }
  return Object.entries(values)
    .map(([key, value]) => `--ami-${key}: ${value};`)
    .join('\n')
}

export const fontMono =
  "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

/* Odd px values below have no theme.core.space equivalent - they match
 * the original extension's card metrics. */

export const Page = styled(Col)`
  ${paletteVars}
  height: 100%;
  min-height: 0;
  background-color: ${palette.bgPrimary};
`

export const HeaderBar = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space300};
  min-height: 60px;
  border-bottom: 1px solid ${palette.separator};
  background: ${palette.bgPrimary};
`

/* Bottom strip with the user-survey link, like the database screen's
 * bottom bar */
export const FooterBar = styled.footer<HTMLAttributes<HTMLElement>>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 26px;
  margin: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space150} 0;
  border-top: 1px solid ${palette.separator};
  border-left: 1px solid ${palette.separator};
  border-right: 1px solid ${palette.separator};
  background: ${palette.bgPrimary};
`

export const SurveyLink = styled.a<AnchorHTMLAttributes<HTMLAnchorElement>>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  height: 100%;
  padding: 0 ${({ theme }) => theme.core.space.space150};
  color: ${palette.textSecondary};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  line-height: 18px;

  &:hover {
    background-color: ${palette.surveyHoverBg};
    color: ${palette.surveyHoverText};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

/* The inspector's own icon (from the original extension), sitting left of
 * the "Redis Agent Memory / <host>" breadcrumb */
export const HeaderIcon = styled.img<ImgHTMLAttributes<HTMLImageElement>>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  /* the extension inverts its duotone icon on dark surfaces */
  filter: ${palette.iconFilter};
`

/* Overview / Long-term memory tab strip under the header, like the
 * instance page's Browse / Search / Workbench bar */
export const InspectorTabs = styled(Row)`
  flex-grow: 0;
  flex-shrink: 0;
  padding: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space300} 0;
  /* the underline track spans the full strip, not just the tabs */
  border-bottom: 4px solid ${palette.paneHeaderBorder};
  background: ${palette.bgPrimary};
  margin-bottom: ${({ theme }) => theme.core.space.space150};

  /* the Tabs component stretches to 100% width by default - shrink it to
   * its content so the strip actually centers */
  & > * {
    width: auto;
  }

  [role='tablist'] {
    border-bottom: none;
  }
`

/* Slightly set off from the breadcrumb's host segment */
export const HeaderPreviewBadge = styled(RiBadge)`
  margin-left: ${({ theme }) => theme.core.space.space100};
`

/* Scope pickers sized to match the explorer's small filter buttons */
export const ScopeSelect = styled(RiSelect)`
  height: ${({ theme }) => theme.components.button.sizes.small.height};
  min-height: ${({ theme }) => theme.components.button.sizes.small.height};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  border-radius: ${({ theme }) =>
    theme.components.button.sizes.small.borderRadius};
`

/* Connection scope pills under the tab strip - the Overview's controls */
export const ContextBar = styled(Row)`
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.core.space.space300}
    ${({ theme }) => theme.core.space.space150};
  background: ${palette.bgPrimary};
`

/* Two resizable panes separated by a draggable handle. The gutter stays
 * the page background - only the panes' own borders mark the split. */
/* Padded wrapper - the resizable PanelGroup forces width:100% via inline
 * style, so side spacing must come from a parent, not margins on it */
export const PanesArea = styled(Row)`
  flex: 1;
  min-height: 0;
  padding: 0 ${({ theme }) => theme.core.space.space150};
  background: ${palette.bgPrimary};
`

export const PanesContainer = styled(ResizableContainer)`
  flex: 1;
  min-height: 0;
  background: ${palette.bgPrimary};
`

export const Pane = styled.section<HTMLAttributes<HTMLElement>>`
  background: ${palette.bgSecondary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  border: 1px solid ${palette.separator};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`

/* Second header row - session metadata (created / TTL / context usage),
 * styled after the browser's key-details subheader */
export const PaneMetaRow = styled(Row)`
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.core.space.space200}
    ${({ theme }) => theme.core.space.space100};
  background: ${palette.bgPrimary};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};

  time,
  code {
    font-family: ${fontMono};
    font-style: normal;
    color: ${palette.textSecondary};
  }
`

export const MetaItem = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
  white-space: nowrap;
`

export const MetaRowActions = styled.span<HTMLAttributes<HTMLSpanElement>>`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
`

export const PaneHeader = styled(Row)`
  flex-grow: 0;
  flex-shrink: 0;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  /* keep both pane headers the same height regardless of whether they
   * contain buttons (working memory's Clear) or just text (ltm stats) */
  min-height: ${({ theme }) => theme.core.space.space550};
  background: ${palette.bgPrimary};
`

/* Wraps a pane's title row + metadata row as one semantic header; the
 * divider sits on the block so the rows read as a single unit */
export const PaneHeaderBlock = styled.header<HTMLAttributes<HTMLElement>>`
  flex-shrink: 0;
  background: ${palette.bgPrimary};
  border-bottom: 1px solid ${palette.paneHeaderBorder};
`

export const PaneTitle = styled(Row)`
  flex-grow: 0;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.core.font.fontSize.s14};
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${palette.text};
  }
`

export const PaneHeaderRight = styled(Row)`
  flex-grow: 0;
  gap: 10px;
`

export const PaneStats = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  /* AutoRefresh forces line-height 1 on its label - match it so flex
   * centering puts both texts' glyphs on the same optical line */
  line-height: 1;
`

export const PaneToolbar = styled(Col)`
  flex-grow: 0;
  flex-shrink: 0;
  gap: 6px;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  background: ${palette.bgPrimary};
  border-bottom: 1px solid ${palette.separator};
`

/* ---------- summary text (summary-views cards) ---------- */

export const SummaryBannerText = styled.p<
  HTMLAttributes<HTMLParagraphElement> & {
    $expanded?: boolean
    ref?: Ref<HTMLParagraphElement>
  }
>`
  margin: 0;
  color: ${palette.text};
  white-space: pre-wrap;
  /* Clamp to 4 lines by default so a long multi-paragraph summary doesn't
   * dominate the pane. The "Show more" toggle drops the clamp. */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${({ $expanded }) =>
    $expanded &&
    `-webkit-line-clamp: unset;
    overflow: visible;`}
`

export const SummaryBannerToggle = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement>
>`
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  font-family: inherit;
  color: ${palette.textMuted};
  cursor: pointer;

  &:hover {
    color: ${palette.text};
  }
`

export const SummaryBannerRefresh = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement>
>`
  appearance: none;
  background: transparent;
  border: none;
  color: ${palette.textMuted};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: 3px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  transition: color 120ms;

  &:hover:not(:disabled) {
    color: ${palette.text};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`

/* ---------- summary-views pane ---------- */

export const SummaryScopeBadge = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s10};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 0.02em;
  background: ${palette.roleAccentBg};
  color: ${palette.roleAccent};
  flex-shrink: 0;
`

/* Scrollable pane body holding one <details> per summary view */
export const SummaryViewsList = styled.div<HTMLAttributes<HTMLDivElement>>`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-height: 0;
`

/* position: relative anchors the controls overlay to the summary row */
export const SummaryViewSection = styled.details<
  DetailsHTMLAttributes<HTMLDetailsElement>
>`
  min-width: 0;
  position: relative;
`

export const SummaryViewHeader = styled.summary<HTMLAttributes<HTMLElement>>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  min-width: 0;
  min-height: 26px;
  /* keep clear of the absolutely-positioned controls overlay */
  padding-right: 240px;
  list-style: none;
  cursor: pointer;
  user-select: none;
  color: ${palette.textSecondary};

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    color: ${palette.text};
  }
`

export const SummaryViewName = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`

/* Sibling of the <summary>, overlaid on its row - interactive controls
 * must not live inside the disclosure button itself */
export const SummaryViewControls = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: absolute;
  top: 0;
  right: 0;
  min-height: 26px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
`

export const SummaryCardList = styled.ul<HTMLAttributes<HTMLUListElement>>`
  list-style: none;
  margin: ${({ theme }) => theme.core.space.space100} 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;

  & > li {
    list-style: none;
    margin: 0;
  }
`

export const SummaryViewBadge = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s10};
  padding: 1px 5px;
  border-radius: 0.02em;
  background: ${palette.chipEntityBg};
  color: ${palette.chipEntityText};
  max-width: 160px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const SummaryViewCount = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  flex-shrink: 0;
`

export const SummaryEmptyState = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space300};
`

/* ---------- long-term search + chip filters ---------- */

export const SearchRow = styled(Row)`
  flex-grow: 0;
`

/* The app's standard search input (magnifier icon, clear button, themed
 * focus state) with the inspector's mono text inside */
export const LtmSearch = styled(SearchInput)`
  flex: 1;
  min-width: 0;

  input {
    font-family: ${fontMono};
    font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  }

  /* magnifier on the right-hand side of the field */
  svg[aria-label='Search'] {
    order: 1;
  }
`

export const FilterRow = styled(Row)`
  flex-grow: 0;
  gap: 5px;
`

export const FilterDropdownList = styled.ul<HTMLAttributes<HTMLUListElement>>`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 240px;
  min-width: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space050};

  & > li {
    list-style: none;
  }
`

export const FilterDropdownEmpty = styled.p<
  HTMLAttributes<HTMLParagraphElement>
>`
  margin: 0;
  color: ${palette.textMuted};
  font-style: italic;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`

export const ActiveFilters = styled(Row)`
  flex-grow: 0;
  gap: 5px;

  &:empty {
    display: none;
  }
`

export const FilterPill = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $kind?: 'topic' | 'entity' }
>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 4px 2px 7px;
  background: ${({ $kind }) =>
    $kind === 'topic'
      ? palette.chipTopicBg
      : $kind === 'entity'
        ? palette.chipEntityBg
        : palette.bgTertiary};
  border: 1px solid ${palette.separator};
  border-radius: 12px;
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${({ $kind }) =>
    $kind === 'topic'
      ? palette.chipTopicText
      : $kind === 'entity'
        ? palette.chipEntityText
        : palette.text};

  em {
    color: ${palette.textMuted};
    font-style: normal;
  }
`

export const FilterPillRemove = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement>
>`
  background: none;
  border: none;
  color: ${palette.textMuted};
  cursor: pointer;
  padding: 0 ${({ theme }) => theme.core.space.space050};
  border-radius: 50%;
  font-size: ${({ theme }) => theme.core.font.fontSize.s13};
  line-height: 1;

  &:hover {
    color: ${palette.dangerText};
    background: ${palette.dangerHoverBg};
  }
`

export const FilterClearAll = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement>
>`
  background: none;
  border: none;
  color: ${palette.textMuted};
  cursor: pointer;
  padding: ${({ theme }) => theme.core.space.space025}
    ${({ theme }) => theme.core.space.space100};
  border-radius: 12px;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  font-family: ${fontMono};

  &:hover {
    color: ${palette.dangerText};
    background: ${palette.dangerHoverBg};
  }
`

/* ---------- card list + cards ---------- */

export const CardList = styled.ul<HTMLAttributes<HTMLUListElement>>`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-height: 0;

  & > li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`

export const EmptyListText = styled.p<HTMLAttributes<HTMLParagraphElement>>`
  color: ${palette.textMuted};
  font-style: italic;
  text-align: center;
  padding: ${({ theme }) => theme.core.space.space300};
  margin: 0;
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
`

export const ErrorText = styled.p<HTMLAttributes<HTMLParagraphElement>>`
  color: ${palette.dangerText};
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  padding: ${({ theme }) => theme.core.space.space050}
    ${({ theme }) => theme.core.space.space200};
  margin: 0;
  flex-shrink: 0;
`

export const Card = styled.article<HTMLAttributes<HTMLElement>>`
  background: ${palette.bgPrimary};
  border: 1px solid ${palette.border};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: 10px 11px;
  flex-shrink: 0;
`

export const CardCompact = styled(Card)`
  p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export const SummaryCard = styled(Card)<{ $empty?: boolean }>`
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  line-height: 1.45;

  ${({ $empty }) =>
    $empty &&
    `p {
      color: ${palette.textMuted};
      font-style: italic;
    }`}
`

/* Meta strip in a summary card's header, centered between the group id
 * and the refresh control */
export const SummaryHeaderMeta = styled.span<HTMLAttributes<HTMLSpanElement>>`
  flex: 1;
  text-align: right;
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`

export const CardMeta = styled.header<HTMLAttributes<HTMLElement>>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: ${({ theme }) => theme.core.space.space025};
  gap: 6px;
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  padding-bottom: 7px;
  margin-bottom: 7px;
  border-bottom: 1px solid ${palette.border};
  white-space: nowrap;

  span,
  time {
    white-space: nowrap;
  }
`

/* Copy control revealed when its enclosing id element is hovered or
 * reached by keyboard; $visible pins it while the Copied badge shows */
export const CopyOnHover = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $visible?: boolean }
>`
  display: inline-flex;
  align-items: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 120ms;
`

export const CardId = styled.span<HTMLAttributes<HTMLSpanElement>>`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};

  &:hover ${CopyOnHover}, &:focus-within ${CopyOnHover} {
    opacity: 1;
  }
`

/* The session id on a records card is a filter affordance (toggles that
 * session in the filter row), styled as the plain code it replaces */
export const CardSessionButton = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement>
>`
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: ${fontMono};
  font-style: normal;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textSecondary};

  &:hover,
  &:focus-visible {
    color: ${palette.roleAccent};
    text-decoration: underline;
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${palette.roleAccent};
    outline-offset: 1px;
  }
`

export const CardText = styled.p<HTMLAttributes<HTMLParagraphElement>>`
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  color: ${palette.text};
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`

export const RoleTag = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $role: string }
>`
  text-transform: uppercase;
  font-weight: 700;
  font-size: ${({ theme }) => theme.core.font.fontSize.s10};
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 0.02em;
  background: ${({ $role }) =>
    $role === 'user' || $role === 'assistant'
      ? palette.roleAccentBg
      : palette.bgTertiary};
  color: ${({ $role }) =>
    $role === 'user' || $role === 'assistant'
      ? palette.roleAccent
      : palette.textSecondary};
`

export const ExtractedFlag = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $extracted: boolean }
>`
  margin-left: auto;
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${({ $extracted }) =>
    $extracted ? palette.successText : palette.textMuted};
`

export const TypeBadge = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $type: string }
>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s10};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 0.02em;
  ${({ $type }) => {
    switch ($type) {
      case 'semantic':
        return `background: ${palette.semanticBadgeBg}; color: ${palette.dangerText};`
      case 'episodic':
        return `background: ${palette.accent}; color: ${palette.dark};`
      case 'message':
        return `background: ${palette.typeMessageBg}; color: ${palette.typeMessageText};`
      default:
        return `background: ${palette.bgTertiary}; color: ${palette.textSecondary};`
    }
  }}
`

export const ScoreBadge = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  padding: 1px 6px;
  border-radius: 10px;
  background: ${palette.semanticBadgeBg};
  color: ${palette.dangerText};
  cursor: help;
`

export const CardFooter = styled.footer<HTMLAttributes<HTMLElement>>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.core.space.space100};
  padding-top: ${({ theme }) => theme.core.space.space100};
  border-top: 1px solid ${palette.border};
`

export { VisuallyHidden } from 'uiSrc/components/base/utils/VisuallyHidden'

export const CardMetaSession = styled.span<HTMLAttributes<HTMLSpanElement>>`
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  /* containing block for the VisuallyHidden label - without this the
   * absolutely-positioned sr-only span resolves against the page and
   * stretches the document with a phantom scrollbar */
  position: relative;

  &:hover ${CopyOnHover}, &:focus-within ${CopyOnHover} {
    opacity: 1;
  }

  code {
    font-family: ${fontMono};
    font-style: normal;
    font-size: ${({ theme }) => theme.core.font.fontSize.s12};
    color: ${palette.textSecondary};
  }
`

export const CardDeleteWrapper = styled.span<HTMLAttributes<HTMLSpanElement>>`
  opacity: 0;
  transition: opacity 120ms ease;
  /* stays right-aligned in the footer even without a session id */
  margin-left: auto;

  ${Card}:hover &,
  &:focus-within {
    opacity: 1;
  }
`

/* ---------- chip rows (TOPICS / ENTITIES) ---------- */

export const ChipRow = styled.div<HTMLAttributes<HTMLDivElement>>`
  margin-top: ${({ theme }) => theme.core.space.space100};
`

export const ChipRowLabel = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: block;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${palette.textSecondary};
  margin-bottom: ${({ theme }) => theme.core.space.space050};
`

export const ChipRowChips = styled(Row)`
  flex-grow: 0;
  gap: 5px;
`

export const Chip = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement> & { $kind: 'topic' | 'entity' }
>`
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  /* Radius + font size match the RiBadge tags (e.g. the Index Types tags
   * on the Search tab) so chips read consistently with the rest of the app */
  border-radius: ${({ theme }) => theme.components.badge.borderRadius};
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  line-height: 1.5;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    border-color 120ms ease,
    transform 80ms ease;
  background: ${({ $kind }) =>
    $kind === 'topic' ? palette.chipTopicBg : palette.chipEntityBg};
  color: ${({ $kind }) =>
    $kind === 'topic' ? palette.chipTopicText : palette.chipEntityText};

  &:hover {
    border-color: currentColor;
  }

  &:active {
    transform: scale(0.96);
  }
`

/* ---------- working-memory summary block ---------- */

export const SummaryBlock = styled.div<HTMLAttributes<HTMLDivElement>>`
  flex-shrink: 0;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  background: ${palette.bgPrimary};
  border-top: 1px solid ${palette.separator};

  h3 {
    margin: 0 0 5px;
    font-size: ${({ theme }) => theme.core.font.fontSize.s12};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${palette.textSecondary};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.core.font.fontSize.s13};
    color: ${palette.text};
    font-style: italic;
  }
`
