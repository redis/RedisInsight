export const PAGE_PLACEHOLDER_ID = 'page-placeholder'

export const removePagePlaceholder = () => {
  const placeholderEl = document.getElementById(PAGE_PLACEHOLDER_ID)
  placeholderEl?.remove()
}
