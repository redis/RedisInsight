import React from 'react'
import { useTheme } from '@redis-ui/styles'
import cx from 'classnames'
import { IconSizeType } from '@redis-ui/icons'
import { MonochromeIconProps } from 'uiSrc/components/base/icons'
import { Theme } from 'uiSrc/components/base/theme/types'

type BaseIconProps = Omit<MonochromeIconProps, 'color' | 'size'> & {
  icon: React.ComponentType<any>
  color?:
    | keyof Theme['semantic']['color']['icon']
    | 'currentColor'
    | (string & {})
  size?: IconSizeType | null
  isSvg?: boolean
  style?: React.CSSProperties
}

const sizesMap = {
  XS: 8,
  S: 12,
  M: 16,
  L: 20,
  XL: 24,
}

/**
 * Type guard function to check if a color is a valid icon color in the theme
 * @param theme The current theme object
 * @param color The color string to check
 * @returns A boolean indicating if the color is valid and a type predicate
 */
function isValidIconColor(
  theme: Theme,
  color: string | number | symbol,
): color is keyof typeof theme.semantic.color.icon {
  return color in theme.semantic.color.icon
}

/**
 * Cache for memoized icon components to prevent creating new component
 * types on every render, which would cause unmount/remount cycles.
 */
const filteredIconCache = new WeakMap<React.ComponentType<any>, React.ComponentType<any>>()

/**
 * Filters out customColor prop that some parent components
 * (like Button.Icon, SideBar.Item.Icon) pass to icons, which causes
 * React warnings when passed to SVG elements that don't support it.
 *
 * Uses WeakMap caching to ensure the same input icon always returns
 * the same wrapped component, preventing React reconciliation issues.
 */
export const iconWithoutCustomColor = (IconComponent: React.ComponentType<any>) => {
  const cached = filteredIconCache.get(IconComponent)
  if (cached) {
    return cached
  }

  const FilteredIcon = ({ customColor: _customColor, ...iconProps }: any) => (
    <IconComponent {...iconProps} />
  )
  FilteredIcon.displayName = `Filtered(${IconComponent.displayName || IconComponent.name || 'Icon'})`

  filteredIconCache.set(IconComponent, FilteredIcon)
  return FilteredIcon
}

export const Icon = ({
  icon: IconComponent,
  isSvg = false,
  customSize,
  customColor,
  color = 'primary600',
  size,
  className,
  style = {},
  ...rest
}: BaseIconProps) => {
  let sizeValue: number | string | undefined
  if (size && sizesMap[size]) {
    sizeValue = sizesMap[size]
  } else if (typeof size === 'undefined') {
    sizeValue = 'L'
  }
  if (customSize) {
    sizeValue = customSize
  }
  const theme = useTheme()
  let colorValue = customColor
  if (!colorValue && isValidIconColor(theme, color)) {
    colorValue = theme.semantic.color.icon[color]
  } else if (color === 'currentColor') {
    colorValue = 'currentColor'
  }

  const svgProps = {
    color: colorValue,
    width: sizeValue,
    height: sizeValue,
    ...rest,
  }

  const props = isSvg
    ? svgProps
    : { color, customColor, size, customSize, ...rest }

  return (
    <IconComponent
      {...props}
      style={{ ...style, verticalAlign: 'middle' }}
      className={cx(className, 'RI-Icon')}
    />
  )
}

export type IconProps = Omit<BaseIconProps, 'icon'>
