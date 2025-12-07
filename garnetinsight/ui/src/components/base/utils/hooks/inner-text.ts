import { useCallback, useEffect, useState } from 'react'

type RefT = HTMLElement | Element | undefined | null

/**
 * `useInnerText` is a hook that provides the text content of the DOM node referenced by `ref`.
 *
 * When `ref` changes, the hook will update the `innerText` value by reading the `ref`'s `innerText` property.
 * If `ref` is null or does not have an `innerText` property, the hook will return `null`.
 *
 * @example
 * const MyComponent = () => {
 *   const [ref, innerText] = useInnerText('default value')
 *
 *   return (
 *     <div ref={ref}>
 *       {innerText}
 *     </div>
 *   )
 * }
 *
 * @param innerTextFallback Value to return if `ref` is null or does not have an `innerText` property.
 * @returns A tuple containing a function to update the `ref` and the current `innerText` value.
 */
export function useInnerText(
  innerTextFallback?: string,
): [(node: RefT) => void, string | undefined] {
  const [ref, setRef] = useState<RefT>(null)
  const [innerText, setInnerText] = useState(innerTextFallback)

  const updateInnerText = useCallback(
    (node: RefT) => {
      if (!node) return
      setInnerText(
        // Check for `innerText` implementation rather than a simple OR check
        // because in real cases the result of `innerText` could correctly be `null`
        // while the result of `textContent` could correctly be non-`null` due to
        // differing reliance on browser layout calculations.
        // We prefer the result of `innerText`, if available.
        'innerText' in node
          ? node.innerText
          : node.textContent || innerTextFallback,
      )
    },
    [innerTextFallback],
  )

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      if (mutationsList.length) updateInnerText(ref)
    })

    if (ref) {
      updateInnerText(ref)
      observer.observe(ref, {
        characterData: true,
        subtree: true,
        childList: true,
      })
    }
    return () => {
      observer.disconnect()
    }
  }, [ref, updateInnerText])

  return [setRef, innerText]
}
