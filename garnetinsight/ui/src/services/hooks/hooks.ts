import { RefObject, useCallback, useEffect, useState } from 'react'

export const useResizableFormField = (
  formRef: RefObject<HTMLDivElement>,
  width: number,
) => {
  const flexFormWidth = 700
  const flexGroupResponsiveForm = 'flexGroupResponsiveForm'
  const flexItemResponsiveForm = 'flexItemResponsiveForm'

  const [flexGroupClassName, setFlexGroupClassName] = useState('')
  const [flexItemClassName, setFlexItemClassName] = useState('')

  useEffect(() => {
    if (formRef.current) {
      const { offsetWidth } = formRef.current

      setFlexItemClassName(
        offsetWidth < flexFormWidth ? flexItemResponsiveForm : '',
      )
      setFlexGroupClassName(
        offsetWidth < flexFormWidth ? flexGroupResponsiveForm : '',
      )
    }
  }, [width])

  return [flexGroupClassName, flexItemClassName]
}

export const useDebouncedEffect = (
  effect: () => void,
  delay: number,
  deps: any[],
) => {
  const callback = useCallback(effect, deps)

  useEffect(() => {
    const handler = setTimeout(() => {
      callback()
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])
}
