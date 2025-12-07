import { Table } from '@redis-ui/table'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledTableWrapper = styled(Col)`
  height: calc(100% - 100px);
`

export const StyledTable = styled(Table)`
  max-height: 100%;
`
