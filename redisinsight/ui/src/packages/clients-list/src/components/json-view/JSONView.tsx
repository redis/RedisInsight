import React, { useEffect, useState } from 'react'
import JSONBigInt from 'json-bigint'
import { formatRedisReply } from 'redisinsight-plugin-sdk'
import JsonPretty from './components/json-pretty'

interface Props {
  value: string
  command: string
}

const JSONView = (props: Props) => {
  const { value, command = '' } = props

  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const parseJSON = async (value: string, command: string) => {
      try {
        const json = JSONBigInt({ useNativeBigInt: true }).parse(value)
        setResult({ value: json, isValid: true })
      } catch (_err) {
        const reply = await formatRedisReply(value, command)
        setResult({ value: reply, isValid: false })
      }
    }

    parseJSON(value, command)
  }, [value])

  if (!result) return null

  return (
    <>
      {result.isValid ? (
        <div className="jsonViewer" data-testid="json-view">
          <JsonPretty data={result.value} space={2} />
        </div>
      ) : (
        <div
          data-testid="cli-output-response-success"
          className="cli-output-response-success"
        >
          {result.value}
        </div>
      )}
    </>
  )
}

export default JSONView
