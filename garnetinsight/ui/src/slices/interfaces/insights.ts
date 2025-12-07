import { Nullable } from 'uiSrc/utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces/workbench'

export enum SidePanels {
  AiAssistant = 'ai',
  Insights = 'insights',
}

export enum InsightsPanelTabs {
  Explore = 'explore',
  Recommendations = 'tips',
}

export interface SidePanelsState {
  openedPanel: Nullable<SidePanels>
  insights: {
    tabSelected: InsightsPanelTabs
  }
  explore: {
    search: string
    itemScrollTop: number
    data: Nullable<string>
    url: Nullable<string>
    manifest: Nullable<IEnablementAreaItem[]>
    isPageOpen: boolean
  }
}
