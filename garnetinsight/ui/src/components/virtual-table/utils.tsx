import React from 'react'

export const StopPropagation = ({ children }: { children: JSX.Element }) => (
  <div
    style={{ height: '100%', width: '100%', position: 'relative' }}
    onClick={(e) => e.stopPropagation()}
    role="presentation"
  >
    {children}
  </div>
)
