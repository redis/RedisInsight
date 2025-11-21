import React from 'react'
import {
  Container,
  TableLoaderTable,
  TableLoaderTitle,
} from './TableLoader.styles'

const TableLoader = () => (
  <Container data-testid="table-loader">
    <TableLoaderTitle lines={1} />
    <TableLoaderTable lines={3} />
  </Container>
)

export default TableLoader
