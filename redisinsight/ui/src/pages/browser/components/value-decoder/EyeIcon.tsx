import React from 'react'

type EyeIconProps = {
  size?: number
  className?: string
}

export const EyeIcon = ({ size = 16, className }: EyeIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M8 3C4.5 3 1.73 5.11 1 8c.73 2.89 3.5 5 7 5s6.27-2.11 7-5c-.73-2.89-3.5-5-7-5zm0 8.5A3.5 3.5 0 1 1 8 4.5a3.5 3.5 0 0 1 0 7z"
      fill="currentColor"
    />
    <circle cx="8" cy="8" r="1.75" fill="currentColor" />
  </svg>
)

export const EyeOffIcon = ({ size = 16, className }: EyeIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M2.15 1.15a.5.5 0 0 0-.7.7l12 12a.5.5 0 0 0 .7-.7l-2.2-2.2A11.7 11.7 0 0 0 15 8c-.73-2.89-3.5-5-7-5a6.9 6.9 0 0 0-3.9 1.2L2.15 1.15zM8 11.5A3.5 3.5 0 0 1 4.5 8c0-.7.2-1.35.55-1.9L9.9 10.95A3.46 3.46 0 0 1 8 11.5zM1 8c.35 1.38 1.2 2.58 2.35 3.45l1.05-1.05A5.96 5.96 0 0 1 2.5 8c.18-.62.45-1.2.8-1.72L2.25 5.23A6.96 6.96 0 0 0 1 8z"
      fill="currentColor"
    />
  </svg>
)
