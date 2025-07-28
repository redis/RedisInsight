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

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export interface LogoLoadingProps extends HTMLAttributes<HTMLImageElement> {
  src: string
  size?: number
  bounceSpeed?: number
  alt?: string
}

const BouncingLogo = styled.img<
  Omit<LogoLoadingProps, 'size' | 'bounceSpeed'> & {
    size?: number
    bounceSpeed: number
  }
>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  animation: ${bounce} ${({ bounceSpeed }) => bounceSpeed}s ease-in-out infinite;
`

const RiLoadingLogo = ({
  src,
  size = 30,
  bounceSpeed = 1,
  alt = 'Loading logo',
}: LogoLoadingProps) => (
  <Wrapper>
    <BouncingLogo src={src} size={size} bounceSpeed={bounceSpeed} alt={alt} />
  </Wrapper>
)

export default RiLoadingLogo
