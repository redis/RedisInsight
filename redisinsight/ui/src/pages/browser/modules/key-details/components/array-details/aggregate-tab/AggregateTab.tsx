import React from 'react'
import { noop } from 'lodash'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Loader } from 'uiSrc/components/base/display'
import { CopyButton } from 'uiSrc/components/copy-button'
import { bufferToString } from 'uiSrc/utils'

import { ArrayAggregateForm } from '../array-aggregate-form'
import { useArrayAggregateQuery } from '../hooks'
import * as S from '../tabs.styles'
import * as L from './AggregateTab.styles'
import { AggregateTabProps } from './AggregateTab.types'

const AGGREGATE_TAB_TEST_ID = 'array-aggregate-tab'
const NIL_RESULT_LABEL = '(nil)'

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
    hasResult,
  } = useArrayAggregateQuery(keyProp)

  // When switching keys, hide the previous key's loader/error/result
  // until the new key is ready.
  const showLoader = isArrayKeyReady && loading
  const showError = isArrayKeyReady && !loading && !!error
  // `hasResult` distinguishes "no AROP run yet" from "ran and got nil" —
  // both leave `result === null`, but only the latter should surface in the
  // result panel. A nil reply is rendered as a non-copyable placeholder; a
  // value reply keeps the input + copy button so the caller can grab the
  // raw bytes (BigInt-safe).
  const showResult = isArrayKeyReady && !loading && !error && hasResult
  const isNilResult = showResult && result === null
  const resultValue = result ?? ''

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
          {showLoader && (
            <FlexItem data-testid={`${AGGREGATE_TAB_TEST_ID}-loading`}>
              <Loader size="m" />
            </FlexItem>
          )}
          {showError && (
            <L.ErrorText
              size="s"
              data-testid={`${AGGREGATE_TAB_TEST_ID}-error`}
            >
              {error}
            </L.ErrorText>
          )}
          {showResult && (
            <L.ResultField label="Result">
              <L.ResultInput
                value={isNilResult ? NIL_RESULT_LABEL : resultValue}
                onChange={noop}
                data-testid={`${AGGREGATE_TAB_TEST_ID}-result-value`}
                {...(isNilResult
                  ? {}
                  : {
                      after: (
                        <CopyButton
                          copy={resultValue}
                          withTooltip={false}
                          data-testid={`${AGGREGATE_TAB_TEST_ID}-result-copy`}
                        />
                      ),
                    })}
              />
            </L.ResultField>
          )}
        </L.ResultPanel>
      </S.TabBody>
    </>
  )
}

export default AggregateTab
