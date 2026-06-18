import React from 'react'
import { noop } from 'lodash'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Loader } from 'uiSrc/components/base/display'
import { CopyButton } from 'uiSrc/components/copy-button'
import { bufferToString } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ArrayAggregateForm } from '../array-aggregate-form'
import { useArrayAggregateQuery } from '../hooks'
import * as S from '../tabs.styles'
import * as L from './AggregateTab.styles'

export interface AggregateTabProps {
  keyProp: RedisResponseBuffer | null
}

const AGGREGATE_TAB_TEST_ID = 'array-aggregate-tab'

const AggregateTab = ({ keyProp }: AggregateTabProps) => {
  const keyName = keyProp ? bufferToString(keyProp) : ''

  const {
    start,
    end,
    operation,
    value,
    setStart,
    setEnd,
    setOperation,
    setValue,
    runQuery,
    resetQuery,
    isArrayKeyReady,
    loading,
    error,
    result,
  } = useArrayAggregateQuery(keyProp)

  const hasResult = !loading && !error && result !== ''

  return (
    <>
      <ArrayAggregateForm
        keyName={keyName}
        start={start}
        end={end}
        operation={operation}
        value={value}
        loading={loading}
        onChangeStart={setStart}
        onChangeEnd={setEnd}
        onChangeOperation={setOperation}
        onChangeValue={setValue}
        onRun={runQuery}
        onReset={resetQuery}
        disabled={!isArrayKeyReady}
      />
      <S.TabBody data-testid={AGGREGATE_TAB_TEST_ID}>
        <L.ResultPanel>
          {loading && (
            <FlexItem data-testid={`${AGGREGATE_TAB_TEST_ID}-loading`}>
              <Loader size="m" />
            </FlexItem>
          )}
          {!loading && error && (
            <L.ErrorText
              size="s"
              data-testid={`${AGGREGATE_TAB_TEST_ID}-error`}
            >
              {error}
            </L.ErrorText>
          )}
          {hasResult && (
            <L.ResultField label="Result">
              <L.ResultInput
                value={result}
                onChange={noop}
                data-testid={`${AGGREGATE_TAB_TEST_ID}-result-value`}
                after={
                  <CopyButton
                    copy={result}
                    withTooltip={false}
                    data-testid={`${AGGREGATE_TAB_TEST_ID}-result-copy`}
                  />
                }
              />
            </L.ResultField>
          )}
        </L.ResultPanel>
      </S.TabBody>
    </>
  )
}

export default AggregateTab
