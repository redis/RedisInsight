import React from 'react'

interface GeoHeaderProps {
  title: string
  status: string
  resultCount?: number
}

export const GeoHeader = ({
  title,
  status,
  resultCount,
}: GeoHeaderProps) => (
  <header className="geodata-header">
    <div>
      <h2>{title}</h2>
    </div>
    <dl aria-label="Result summary">
      <div>
        <dt>Status</dt>
        <dd>{status || 'unknown'}</dd>
      </div>
      {resultCount !== undefined && (
        <div>
          <dt>Results</dt>
          <dd>{resultCount}</dd>
        </div>
      )}
    </dl>
  </header>
)
