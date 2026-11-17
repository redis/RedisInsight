import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import parse from 'html-react-parser'
import { monaco } from 'react-monaco-editor'

import { CodeBlock } from 'uiSrc/components'
import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import { MonacoLanguage } from 'uiSrc/constants'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  target?: string
}

const DryRunJobCommands = ({ target }: Props) => {
  const { t } = useTranslation()
  const { results } = useAppSelector(rdiDryRunJobSelector)
  const [commands, setCommands] = useState<string>('')

  useEffect(() => {
    if (!results) {
      return
    }

    const noCommandsMessage = t('rdi.pipeline.dryRun.noCommands')

    try {
      const targetCommands = results?.output?.find(
        (el) => el.connection === target,
      )?.commands

      if (!targetCommands) {
        setCommands(noCommandsMessage)
        return
      }
      monaco.editor
        .colorize(
          (targetCommands ?? []).join('\n').trim(),
          MonacoLanguage.Redis,
          {},
        )
        .then((data) => {
          setCommands(data)
        })
    } catch (e) {
      setCommands(noCommandsMessage)
    }
  }, [results, target, t])

  return (
    <div className="rdi-dry-run__codeBlock" data-testid="commands-output">
      <CodeBlock className="rdi-dry-run__code">{parse(commands)}</CodeBlock>
    </div>
  )
}

export default DryRunJobCommands
