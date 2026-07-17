import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import MonacoJson from 'uiSrc/components/monaco-editor/components/monaco-json'
import { useTranslation } from 'uiSrc/i18n'

const DryRunJobTransformations = () => {
  const { t } = useTranslation()
  const { results } = useAppSelector(rdiDryRunJobSelector)

  const [transformations, setTransformations] = useState('')

  useEffect(() => {
    if (!results) {
      return
    }

    const noTransformationMessage = t('rdi.pipeline.dryRun.noTransformation')

    try {
      const transformations = JSON.stringify(results?.transformation, null, 2)
      setTransformations(transformations || noTransformationMessage)
    } catch (e) {
      setTransformations(noTransformationMessage)
    }
  }, [results, t])

  return (
    <>
      <MonacoJson
        readOnly
        value={transformations}
        wrapperClassName="rdi-dry-run__transformationsCode"
        data-testid="transformations-output"
        fullHeight
      />
    </>
  )
}

export default DryRunJobTransformations
