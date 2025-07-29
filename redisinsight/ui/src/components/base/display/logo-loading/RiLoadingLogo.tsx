import React, { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
`

export const SIZES = ['M', 'L', 'XL', 'XXL'] as const

export type RiLoadingLogoSize = (typeof SIZES)[number]

export interface LogoLoadingProps extends HTMLAttributes<HTMLImageElement> {
  src: string
  $size?: RiLoadingLogoSize
  $bounceSpeed?: number
  alt?: string
}

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const BouncingLogo = styled.img<LogoLoadingProps>`
  width: ${({ theme, $size = 'XL' }) =>
    theme.components.iconButton.sizes[$size].width};
  animation: ${bounce} ${({ $bounceSpeed }) => $bounceSpeed}s ease-in-out
    infinite;
`

const RiLoadingLogo = ({
  src,
  $size = 'XL',
  $bounceSpeed = 1,
  alt = 'Loading logo',
}: LogoLoadingProps) => (
  <Wrapper>
    <BouncingLogo
      src={src}
      $size={$size}
      $bounceSpeed={$bounceSpeed}
      alt={alt}
    />
  </Wrapper>
)

export default RiLoadingLogo
