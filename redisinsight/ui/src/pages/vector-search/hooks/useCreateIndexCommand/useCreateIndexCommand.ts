import { useMemo } from 'react'
import { generateFtCreateCommand } from '../../utils/generateFtCreateCommand'

import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { getIndexNameBySampleData } from '../../utils/sampleData'

export interface UseCreateIndexCommandResult {
  command: string
  indexName: string
}

/**
 * Hook that derives the FT.CREATE command for a given sample data choice.
 * Returns the command string and the resolved index name.
 *
 * When sampleData is undefined (e.g. ExistingData mode), returns empty defaults.
 *
 * Designed to be extensible: later, this can accept a key-based definition
 * and generate the command dynamically based on existing key fields.
 */
export const useCreateIndexCommand = (
  sampleData?: SampleDataContent,
  indexNameOverride?: string,
): UseCreateIndexCommandResult => {
  const indexName =
    indexNameOverride ??
    (sampleData ? getIndexNameBySampleData(sampleData) : '')

  const command = useMemo(() => {
    if (!sampleData) {
      return ''
    }

    return generateFtCreateCommand({
      indexName,
      dataContent: sampleData,
    })
  }, [indexName, sampleData])

  return { command, indexName }
}
