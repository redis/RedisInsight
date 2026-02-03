import React from 'react'

import { LoadingContent } from 'uiSrc/components/base/layout'
import * as S from './QueryCardCommonResult.styles'

export interface Props {
  result: React.ReactElement | string
  loading?: boolean
}

const QueryCardCommonResult = (props: Props) => {
  const { result, loading } = props

  return (
    <S.Container data-testid="query-common-result-wrapper">
      {!loading && (
        <div data-testid="query-common-result">{result || '(nil)'}</div>
      )}
      {loading && (
        <S.Loading>
          <LoadingContent lines={1} />
        </S.Loading>
      )}
    </S.Container>
  )
}

export default QueryCardCommonResult
