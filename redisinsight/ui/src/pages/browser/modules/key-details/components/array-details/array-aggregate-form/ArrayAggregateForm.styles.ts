import styled from 'styled-components'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

const OPERATION_SELECT_MIN_WIDTH = '100px'

export const OperationSelect = styled(RiSelect)`
  min-width: ${OPERATION_SELECT_MIN_WIDTH};
`
