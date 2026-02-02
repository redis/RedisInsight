import styled from 'styled-components'
import { EuiAccordion } from '@elastic/eui'

export const AccordionWrapper = styled(EuiAccordion)`
  .euiAccordion__triggerWrapper,
  .euiAccordion__childWrapper {
    background-color: transparent;
  }

  .euiAccordion__icon.euiAccordion__icon-isOpen {
    transform: rotate(90deg);
  }

  .euiAccordion__icon {
    transform: rotate(0);
  }
`
