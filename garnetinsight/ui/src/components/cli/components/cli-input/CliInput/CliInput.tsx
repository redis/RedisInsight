import React from 'react'
import { ContentEditableEvent } from 'react-contenteditable'

import { ContentEditable } from 'uiSrc/components'
import { parseContentEditableChangeHtml } from 'uiSrc/components/ContentEditable'
import { getDbIndex } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  command: string
  setInputEl: Function
  setCommand: (command: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void
  dbIndex: number
}

const CliInput = (props: Props) => {
  const { command = '', setInputEl, setCommand, onKeyDown, dbIndex = 0 } = props

  const onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation()
  }

  const onChange = (e: ContentEditableEvent) => {
    setCommand(parseContentEditableChangeHtml(e.target.value ?? ''))
  }

  return (
    <>
      <span>
        {dbIndex !== 0 && (
          <span data-testid="cli-db-index">{`${getDbIndex(dbIndex)} `}</span>
        )}
        &gt;&nbsp;
      </span>
      <ContentEditable
        tagName="span"
        html={command}
        id={styles.command}
        spellCheck={false}
        data-testid="cli-command"
        innerRef={setInputEl}
        onKeyDown={onKeyDown}
        onMouseUp={onMouseUp}
        onChange={onChange}
      />
    </>
  )
}

export default CliInput
