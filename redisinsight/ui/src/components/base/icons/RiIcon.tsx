import React, { ImgHTMLAttributes, SVGProps } from 'react'
import cx from 'classnames'
import { IconProps } from './Icon'
import * as Icons from './iconRegistry'

export type AllIconsType = keyof typeof Icons

export type IconComponentProps = Omit<IconProps, 'icon' | 'size'> &
  Omit<SVGProps<SVGSVGElement>, 'color' | 'size'> & {
    type: AllIconsType
    size?:
      | IconProps['size']
      | 'm'
      | 's'
      | 'xs'
      | 'l'
      | 'xl'
      | 'xxl'
      | 'original'
  }

// Fallback sizes for image icons (when icon is not found in the iconRegistry)
const IMAGE_SIZES_MAP: Record<string, number> = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 24,
}

export const RiIcon = ({ type, size, ...props }: IconComponentProps) => {
  const IconType = Icons[type]
  if (!IconType) {
    console.warn(`Icon type "${type}" not found, rendering as image`)
    // TODO - 17.06.25 - Replace with icon
    //  There are a few cases where type is just imported image asset. In most cases, it seems
    //  that the image is an svg in the plugins folder - http://localhost:5540/static/plugins/redisearch/./dist/table_view_icon_light.svg
    //  we can either just scratch the plugins and move assets in to the main project, or look into dynamically loading as icons in runtime

    const sizeValue = size ? IMAGE_SIZES_MAP[size.toLowerCase()] : undefined
    const imageSizeStyle = sizeValue
      ? { width: `${sizeValue}px`, height: `${sizeValue}px` }
      : {}

    return (
      <img
        {...(props as ImgHTMLAttributes<HTMLImageElement>)}
        alt={props.title ? props.title : ''}
        src={type}
        className={cx(type, props.className)}
        style={{ ...imageSizeStyle, ...props.style }}
      />
    )
  }
  let iconSize: IconProps['size']

  switch (size?.toLowerCase()) {
    case 'm':
      iconSize = 'M'
      break
    case 's':
      iconSize = 'S'
      break
    case 'xs':
      iconSize = 'XS'
      break
    case 'xl':
    case 'xxl':
      iconSize = 'XL'
      break
    case 'original':
      iconSize = null
      break
    case 'l':
    default:
      iconSize = 'L'
  }
  // @ts-ignore
  return <IconType {...props} size={iconSize} />
}
