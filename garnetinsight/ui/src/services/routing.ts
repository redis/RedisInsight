import { createLocation } from 'history'

export const isModifiedEvent = (event: any) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

const isLeftClickEvent = (event: any) => event.button === 0

let router: any
export const registerRouter = (reactRouter: any): any => {
  router = reactRouter
}

export const getRouterLinkProps = (to: any, customOnClick?: () => void) => {
  const location =
    typeof to === 'string'
      ? createLocation(to, null, '', router?.history?.location)
      : to

  const href = router?.history?.createHref(location)

  const onClick = (event: any) => {
    customOnClick?.()

    if (event.defaultPrevented) {
      return
    }

    // If target prop is set (e.g. to "_blank"), let browser handle link.
    if (event?.target?.getAttribute('target')) {
      return
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return
    }

    // Prevent regular link behavior, which causes a browser refresh.
    event.preventDefault()
    router?.history?.push(location)
  }

  return { href, onClick }
}
