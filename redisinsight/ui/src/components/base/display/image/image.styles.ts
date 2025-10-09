import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

export const SIZES = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'original',
  'fullWidth',
] as const

export const imageSizeStyles = {
  xs: css`
    width: 50px;
  `,
  s: css`
    width: 100px;
  `,
  m: css`
    width: 200px;
  `,
  l: css`
    width: 360px;
  `,
  xl: css`
    width: 600px;
  `,
  original: css`
    width: auto;
  `,
  fullWidth: css`
    width: 100%;
  `,
}

export type RiImageSize = (typeof SIZES)[number]

export interface RiImageProps extends HTMLAttributes<HTMLImageElement> {
  $size?: RiImageSize
  src: string
  alt: string
}

export const StyledImage = styled.img<RiImageProps>`
  ${({ $size = 'original' }) => imageSizeStyles[$size]}
`
