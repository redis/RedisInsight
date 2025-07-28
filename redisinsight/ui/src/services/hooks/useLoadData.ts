import { useCallback, useState } from 'react'

interface UseLoadDataResult {
  data: string | null
  error: Error | null
  loading: boolean
  load: (filePath: string) => Promise<string>
}

export const useLoadData = (): UseLoadDataResult => {
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(async (filePath: string): Promise<string> => {
    if (!filePath) {
      const err = new Error('File path is required')
      setError(err)
      throw err
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
      return text
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, error, loading, load }
}
