import type { Meta, StoryObj } from "@storybook/react-vite"

import RdiInstancesListCell from "./RdiInstancesListCell"
import { RdiListColumn } from "uiSrc/constants"
import { rdiInstanceFactory } from "uiSrc/mocks/rdi/RdiInstance.factory"
import { Column } from "@redis-ui/table"
import { RdiInstance } from "uiSrc/slices/interfaces"

const meta: Meta<typeof RdiInstancesListCell> = {
  component: RdiInstancesListCell,
  args: {
    row: {
      original: rdiInstanceFactory.build(),
    } as any,
    column: {
      id: RdiListColumn.Url,
    } as any as Column<RdiInstance, string>,
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
