import { KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'

export interface VectorSetDetailsProps extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}
