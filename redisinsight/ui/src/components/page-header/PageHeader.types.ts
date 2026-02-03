import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react'

export interface PageHeaderProps {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  showInsights?: boolean
  className?: string
}

export type DivProps = HTMLAttributes<HTMLDivElement>
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>
