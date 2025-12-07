import * as monacoLib from 'monaco-editor'
import { useEffect, useState } from 'react'

const errorSeverity = 8

const useMonacoValidation = (
  editorRef: React.MutableRefObject<monacoLib.editor.IStandaloneCodeEditor | null>,
  monacoInstance?: typeof monacoLib,
) => {
  const monaco = monacoInstance || monacoLib

  // setIsValid is updated only when markers change.
  // However, Monaco does not emit marker updates for every edit.
  // For example, if you delete part of the code but the result is still valid JSON,
  // Monaco might skip updating the markers.
  // Example:
  // Before: [{ "key": "value" }, { "foo": "bar" }]
  // After deleting: , { "foo": "bar" } -> Monaco may not emit marker changes since it's still valid.
  // That's why we initialize isValid = true.
  // On the other hand, if the edit makes the JSON invalid:
  // e.g., deleting just { "foo": "bar" } (but leaving the comma),
  // Monaco will detect the syntax error and update the markers.
  const [isValid, setIsValid] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    // Mark as "validating" when content changes
    const contentChangeDisposable = editor.onDidChangeModelContent(() => {
      setIsValidating(true)
    })

    // Update validation when markers change
    // Listening to markers change event is debounced
    const markerChangeDisposable = monaco.editor.onDidChangeMarkers((uris) => {
      if (!editorRef.current) return
      if (!uris.some((u) => u.toString() === model.uri.toString())) return

      const markers = monaco.editor.getModelMarkers({ resource: model.uri })
      const hasErrors = markers.some((m) => m.severity === errorSeverity)

      setIsValid(!hasErrors)
      setIsValidating(false)
    })

    // Catch formatting or silent model changes that don't touch markers
    const decorationsDisposable = editor.onDidChangeModelDecorations(() => {
      setIsValidating(false)
    })

    // eslint-disable-next-line consistent-return
    return () => {
      contentChangeDisposable.dispose()
      markerChangeDisposable.dispose()
      decorationsDisposable.dispose()
    }
  }, [editorRef, monaco])

  return { isValid, isValidating }
}

export default useMonacoValidation
