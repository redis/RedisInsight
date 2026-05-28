import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'

import { ShellProps } from './Shell.types'

export const Shell = ({ children }: ShellProps) => (
  <Col className="geodata-shell" gap="m">
    {children}
  </Col>
)
