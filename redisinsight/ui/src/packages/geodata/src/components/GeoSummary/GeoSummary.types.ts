import React from 'react'

export interface GeoSummaryItem {
  label: string
  value: React.ReactNode
}

export interface GeoSummaryProps {
  ariaLabel: string
  items: GeoSummaryItem[]
}
