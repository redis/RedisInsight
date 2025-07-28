import React from 'react'
import { useTheme } from '@redis-ui/styles'
import ReactMonacoEditor from 'react-monaco-editor'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Theme = () => {
  const theme = useTheme()
  const monacoOptions = {
    readOnly: true,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  }
  return (
    <Col align="center">
      <ReactMonacoEditor
        language="json"
        value={JSON.stringify(theme, null, 2)}
        options={monacoOptions}
        theme="light"
        height={500}
        width={900}
      />
    </Col>
  )
}
