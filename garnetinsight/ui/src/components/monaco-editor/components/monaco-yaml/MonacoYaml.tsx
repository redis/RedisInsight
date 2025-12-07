import React, { useEffect } from 'react'
import { isNull } from 'lodash'

import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'
import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import { Nullable } from 'uiSrc/utils'
import {
  DEFAULT_MONACO_FILE_MATCH,
  DEFAULT_MONACO_YAML_URI,
} from 'uiSrc/constants'
import { monacoYamlModel } from './monacoYamlModel'

export interface Props extends CommonProps {
  schema: Nullable<object>
  uri?: string
  fileMatch?: string
}

const MonacoYaml = (props: Props) => {
  const {
    schema,
    uri = DEFAULT_MONACO_YAML_URI,
    fileMatch = DEFAULT_MONACO_FILE_MATCH,
    value,
    onChange,
    ...rest
  } = props

  useEffect(() => {
    if (!isNull(schema)) {
      monacoYamlModel?.update({
        schemas: [
          {
            schema,
            uri,
            fileMatch: [fileMatch],
          },
        ],
      })
    }
  }, [schema, uri, fileMatch])

  const editorWillMount = () => {
    monacoYamlModel?.update({
      schemas: [
        {
          schema: schema || {},
          uri,
          fileMatch: [fileMatch],
        },
      ],
    })
  }

  return (
    <MonacoEditor
      {...rest}
      language="yaml"
      value={value}
      onChange={onChange}
      onEditorWillMount={editorWillMount}
      options={{
        hover: {
          enabled: true,
        },
        stickyScroll: {
          enabled: true,
          defaultModel: 'indentationModel',
        },
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'boundary',
        quickSuggestions: {
          other: 'inline',
          comments: true,
          strings: true,
        },
        suggest: {
          preview: true,
          showStatusBar: true,
          showIcons: true,
          showProperties: true,
        },
      }}
    />
  )
}

export default React.memo(MonacoYaml)
