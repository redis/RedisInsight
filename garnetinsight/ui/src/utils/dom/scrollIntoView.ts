import { Nullable } from 'uiSrc/utils'

const isScrollBehaviorSupported = (): boolean =>
  'scrollBehavior' in globalThis.document.documentElement.style

export const scrollIntoView = (
  el: Nullable<HTMLDivElement>,
  opts?: ScrollIntoViewOptions,
) => {
  if (el && isScrollBehaviorSupported()) {
    el?.scrollIntoView(opts)
  } else {
    el?.scrollIntoView(true)
  }
}
