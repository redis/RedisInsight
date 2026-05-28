import React from 'react'

interface MessageProps {
  title?: string
  children: React.ReactNode
}

export const Message = ({ title = 'Geodata visualization', children }: MessageProps) => (
  <section className="geodata-message" role="status">
    <h3>{title}</h3>
    <div>{children}</div>
  </section>
)
