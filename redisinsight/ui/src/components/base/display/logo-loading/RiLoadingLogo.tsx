import React, { HTMLAttributes } from 'react'
import styled, { css, keyframes } from 'styled-components'

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
`

export const SIZES = ['m', 'l', 'xl'] as const

const logoSizeStyles = {
  m: css`
    width: var(--size-m);
  `,
  l: css`
    width: var(--size-l);
  `,
  xl: css`
    width: var(--size-xl);
  `,
}

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
  ${({ $size = 'xl' }) => logoSizeStyles[$size]};
  animation: ${bounce} ${({ $bounceSpeed }) => $bounceSpeed}s ease-in-out
    infinite;
`

const RiLoadingLogo = ({
  src,
  $size = 'xl',
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
