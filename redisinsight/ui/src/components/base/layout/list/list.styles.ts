import styled, { css } from 'styled-components'
import {
  AllHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from 'react'

import { AllIconsType } from 'uiSrc/components/base/icons/RiIcon'
import { IconProps } from 'uiSrc/components/base/icons'
import { Theme } from 'uiSrc/components/base/theme/types'

export const ListClassNames = {
  listItem: 'RI-list-group-item',
  listItemLabel: 'RI-list-group-item-label',
  listItemButton: 'RI-list-group-item-button',
  listItemText: 'RI-list-group-item-text',
  listGroup: 'RI-list-group',
  listItemActive: 'isActive',
  listItemDisabled: 'isDisabled',
}

export const MAX_FORM_WIDTH = 400

export type ListGroupProps = HTMLAttributes<HTMLUListElement> & {
  className?: string
  /**
   * Remove container padding, stretching list items to the edges
   * @default false
   */
  flush?: boolean

  /**
   * Spacing between list items
   * @default s
   */
  gap?: keyof typeof listStyles.gap

  /**
   * Sets the max-width of the page.
   * Set to `true` to use the default size,
   * set to `false` to not restrict the width,
   * or set to a number/string for a custom CSS width/measurement.
   *
   * @default true
   */
  maxWidth?: boolean | CSSProperties['maxWidth']
}

export const listStyles = {
  gap: {
    none: 'gap: 0;',
    s: css`
      gap: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    `,
    m: css`
      gap: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
    `,
  },
  flush: css`
    margin: 0;
    padding: 0;
    border: 0 none;

    .${ListClassNames.listItem} {
      border-radius: 0;
    }
  `,
}

export const StyledGroup = styled.ul<
  Omit<ListGroupProps, 'gap' | 'flush' | 'maxWidth'> & {
    $gap?: keyof typeof listStyles.gap
    $flush?: boolean
  }
>`
  display: flex;
  flex-direction: column;
  ${({ $gap = 's' }) => listStyles.gap[$gap]};
  ${({ $flush = false }) => $flush && listStyles.flush};
`

export const SIZES = ['xs', 's', 'm', 'l'] as const
export type ListGroupItemSize = (typeof SIZES)[number]

export const COLORS = ['primary', 'text', 'subdued', 'ghost'] as const
export type ListGroupItemColor = (typeof COLORS)[number]

export type ListGroupItemProps = HTMLAttributes<HTMLLIElement> & {
  /**
   * Size of the label text
   */
  size?: ListGroupItemSize
  /**
   * By default, the item will get the color `text`.
   * You can customize the color of the item by passing a color name.
   */
  color?: ListGroupItemColor

  /**
   * Content to be displayed in the list item
   */
  label: ReactNode

  /**
   * Apply styles indicating an item is active
   */
  isActive?: boolean

  /**
   * Apply styles indicating an item is disabled
   */
  isDisabled?: boolean

  /**
   * Adds `RiIcon` of `RiIcon.type`
   */
  iconType?: AllIconsType

  /**
   * Further extend the props applied to RiIcon
   */
  iconProps?: IconProps

  /**
   * Custom node to pass as the icon. Cannot be used in conjunction
   * with `iconType` and `iconProps`.
   */
  icon?: ReactElement

  /**
   * Make the list item label a button.
   * While permitted, `href` and `onClick` should not be used together in most cases and may create problems.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>

  /**
   * Allow link text to wrap
   */
  wrapText?: boolean

  /**
   * Pass-through ref reference specifically for targeting
   * instances where the item content is rendered as a `button`
   */
  buttonRef?: Ref<HTMLButtonElement>
}

const listItemStyles = {
  size: {
    xs: css`
      border-radius: var(--border-radius-small);
    `,
    s: css`
      border-radius: var(--border-radius-small);
    `,
    m: css`
      border-radius: var(--border-radius-medium);
    `,
    l: css`
      border-radius: var(--border-radius-medium);
    `,
  },
  active: {
    primary: css`
      background-color: var(--color-primary);
    `,
    text: css`
      background-color: var(--color-subdued);
    `,
    subdued: css`
      background-color: var(--color-subdued);
    `,
    ghost: css`
      background-color: var(--color-ghost);
    `,
  },
  clickable: {
    primary: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    text: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    subdued: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    ghost: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-ghost);
      }
    `,
  },
}

export const StyledItem = styled.li<
  Omit<
    ListGroupItemProps,
    'label' | 'color' | 'size' | 'isDisabled' | 'isActive'
  > & {
    $size?: ListGroupItemSize
    $color?: ListGroupItemColor
    $isDisabled?: boolean
    $isActive?: boolean
  }
>`
  padding: 0;
  display: flex;
  align-items: center;
  position: relative;
  transition: background-color 150ms;
  ${({ $size = 'm' }) => listItemStyles.size[$size]};
  ${({ $isActive = false, $color = 'text' }) =>
    $isActive && listItemStyles.active[$color]};
  ${({ onClick, $color = 'text' }) =>
    onClick !== undefined && listItemStyles.clickable[$color]};
`

const listItemInnerStyles = {
  base: css`
    padding: var(--size-xs) var(--size-s);
    display: flex;
    align-items: center;
    flex-grow: 1;
    max-inline-size: 100%;
    overflow: hidden;
    text-align: start;
    font-weight: inherit;
  `,
  size: {
    xs: css`
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-m);
      letter-spacing: 0;
      min-height: var(--size-l);
    `,
    s: css`
      font-size: var(--font-size-s);
      font-weight: var(--font-weight-m);
      letter-spacing: 0;
      min-height: var(--size-xl);
    `,
    m: css`
      font-size: var(--font-size-m);
      min-height: var(--size-xl);
    `,
    l: css`
      font-size: var(--font-size-l);
      min-height: var(--size-xxl);
    `,
  },
  colors: {
    // Colors
    primary: css`
      color: ${({ theme }: { theme: Theme }) =>
        theme.components.typography.colors.primary};
    `,
    text: css`
      color: ${({ theme }: { theme: Theme }) =>
        theme.components.typography.colors.secondary};
    `,
    subdued: css`
      color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.text.informative400};
    `,
    ghost: css`
      color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.text.neutral600};
    `,
  },
  variants: {
    // Variants
    isDisabled: css`
      cursor: not-allowed;

      &,
      &:hover,
      &:focus {
        color: #ffffff;
        background-color: transparent;
        text-decoration: none;
      }
    `,
    isActive: css``,
    isClickable: css`
      &:hover,
      &:focus {
        text-decoration: underline;
      }
    `,
    externalIcon: css`
      margin-left: var(--size-s);
    `,
  },
}

type InnerProps = {
  $size?: ListGroupItemSize
  $color?: ListGroupItemColor
  $isActive?: boolean
  $isDisabled?: boolean
  $isClickable?: boolean
  ref?: React.Ref<HTMLButtonElement | HTMLSpanElement>
}

export const StyledItemInnerButton = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement> & InnerProps
>`
  ${listItemInnerStyles.base}
  ${({ $size = 'm' }) => listItemInnerStyles.size[$size]}
    ${({ $isActive = false }) =>
    $isActive && listItemInnerStyles.variants.isActive}
    ${({ $isDisabled = false }) =>
    $isDisabled && listItemInnerStyles.variants.isDisabled}
    ${({ $isDisabled = false, $color = 'text' }) =>
    !$isDisabled && listItemInnerStyles.colors[$color]}
    ${({ $isDisabled = false, $isClickable = false }) =>
    !$isDisabled && $isClickable && listItemInnerStyles.variants.isClickable}
`

export const StyledItemInnerSpan = styled.span<
  Omit<AllHTMLAttributes<HTMLSpanElement>, 'size'> & InnerProps
>`
  ${listItemInnerStyles.base}
  ${({ $size = 'm' }) => listItemInnerStyles.size[$size]}
    ${({ $isActive = false }) =>
    $isActive && listItemInnerStyles.variants.isActive}
    ${({ $isDisabled = false }) =>
    $isDisabled && listItemInnerStyles.variants.isDisabled}
    ${({ $isDisabled = false, $color = 'text' }) =>
    !$isDisabled && listItemInnerStyles.colors[$color]}
    ${({ $isDisabled = false, $isClickable = false }) =>
    !$isDisabled && $isClickable && listItemInnerStyles.variants.isClickable}
`

const listItemLabelStyles = {
  truncate: css`
    max-width: 100%;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  `,
  wrapText: css`
    overflow-wrap: break-word !important; // makes sure the long string will wrap and not bust out of the container
    word-break: break-word;
  `,
}

export const StyledLabel = styled.span<{
  wrapText?: boolean
  children: ReactNode
  className?: string
  title?: string | ReactNode
  ref?: React.Ref<HTMLSpanElement>
}>`
  white-space: break-spaces;
  ${({ wrapText }) =>
    wrapText ? listItemLabelStyles.wrapText : listItemLabelStyles.truncate}
`
