import { monaco } from 'react-monaco-editor'

let jsonValidationSuppressors = 0

const setJsonValidation = (validate: boolean) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate })
}

export const suppressJsonValidation = () => {
  if (jsonValidationSuppressors === 0) {
    setJsonValidation(false)
  }
  jsonValidationSuppressors += 1
}

export const restoreJsonValidation = () => {
  if (jsonValidationSuppressors === 0) return

  jsonValidationSuppressors -= 1
  if (jsonValidationSuppressors === 0) {
    setJsonValidation(true)
  }
}

export const isJsonValid = (text: string): boolean => {
  const trimmed = text.trim()
  if (!trimmed) return true
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}
