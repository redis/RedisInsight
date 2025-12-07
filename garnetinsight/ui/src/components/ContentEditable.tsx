import React from 'react'
import ReactContentEditable, { Props } from 'react-contenteditable'

const useRefCallback = <T extends any[]>(
  value: ((...args: T) => void) | undefined,
  deps?: React.DependencyList,
): ((...args: T) => void) => {
  const ref = React.useRef(value)

  React.useEffect(
    () => {
      ref.current = value
    },
    deps ?? [value],
  )

  return React.useCallback((...args: T) => {
    ref.current?.(...args)
  }, [])
}

// remove line break and encode angular brackets
export const parsePastedText = (text: string = '') =>
  text.replace(/\n/gi, '').replace(/</gi, '<').replace(/>/gi, '>')

export const parseContentEditableChangeHtml = (text: string = '') =>
  text.replace(/&nbsp;/gi, ' ')

export const parseMultilineContentEditableChangeHtml = (text: string = '') =>
  parseContentEditableChangeHtml(text).replace(/<br>/gi, ' ')

export const parseContentEditableHtml = (text: string = '') =>
  text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')

const onPaste = (e: React.ClipboardEvent) => {
  e.preventDefault()

  const clipboardData =
    e.clipboardData || window.clipboardData || e.originalEvent.clipboardData
  const text = clipboardData.getData('text/plain') as string

  document.execCommand('insertText', false, parsePastedText(text))
}

export default function ContentEditable({
  ref,
  onChange,
  onInput,
  onBlur,
  onKeyPress,
  onKeyDown,
  onMouseUp,
  ...props
}: Props) {
  const onChangeRef = useRefCallback(onChange)
  const onInputRef = useRefCallback(onInput)
  const onBlurRef = useRefCallback(onBlur)
  const onKeyPressRef = useRefCallback(onKeyPress)
  const onKeyDownRef = useRefCallback(onKeyDown)
  const onMouseUpRef = useRefCallback(onMouseUp)

  return (
    <ReactContentEditable
      {...props}
      onPaste={onPaste}
      onChange={onChangeRef}
      onInput={onInputRef}
      onBlur={onBlurRef}
      onKeyPress={onKeyPressRef}
      onKeyDown={onKeyDownRef}
      onMouseUp={onMouseUpRef}
    />
  )
}
