import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { rdiDryRunJobSelector } from 'uiSrc/slices/rdi/dryRun'
import MonacoJson from 'uiSrc/components/monaco-editor/components/monaco-json'

const NO_TRANSFORMATION_MESSAGE =
  'No transformation results provided by the server.'

const DryRunJobTransformations = () => {
  const { results } = useAppSelector(rdiDryRunJobSelector)

  const [transformations, setTransformations] = useState('')

  useEffect(() => {
    if (!results) {
      return
    }

    try {
      const transformations = JSON.stringify(results?.transformation, null, 2)
      setTransformations(transformations || NO_TRANSFORMATION_MESSAGE)
    } catch (e) {
      setTransformations(NO_TRANSFORMATION_MESSAGE)
    }
  }, [results])

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
