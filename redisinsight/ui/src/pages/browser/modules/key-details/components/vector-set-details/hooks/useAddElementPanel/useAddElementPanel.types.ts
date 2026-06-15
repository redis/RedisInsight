export interface UseAddElementPanelParams {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

export interface UseAddElementPanelResult {
  isAddItemPanelOpen: boolean
  openAddItemPanel: () => void
  closeAddItemPanel: (isCancelled?: boolean) => void
}
