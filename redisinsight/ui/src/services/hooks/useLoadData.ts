import { useCallback, useState } from 'react'

interface UseLoadDataResult {
  data: string | null
  error: Error | null
  loading: boolean
  load: () => Promise<void>
}

export const useLoadData = (filePath: string): UseLoadDataResult => {
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(async () => {
    if (!filePath) {
      setError(new Error('File path is required'))
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(filePath)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${res.statusText}`)
      }

      const text = await res.text()
      setData(text)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [filePath])

  return { data, error, loading, load }
}
