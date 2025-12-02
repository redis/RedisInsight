import type { AllIconsType } from "uiSrc/components/base/icons"

export interface DatabaseModuleItemProps {
  abbreviation?: string
  icon?: AllIconsType | null
  content?: string
  inCircle?: boolean
  onCopy?: (text: string) => void
}

