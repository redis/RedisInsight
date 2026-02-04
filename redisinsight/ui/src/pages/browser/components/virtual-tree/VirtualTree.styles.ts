import styled from 'styled-components'
import { Loader, RiImage } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Row } from 'uiSrc/components/base/layout/flex'

const LOADER_SIZE = '54px'

export const customScrollClassName = 'custom-scroll'

export const TreeWrapper = styled.div`
  .${customScrollClassName} {
    height: 100%;
    position: relative;
  }
`

export const LoadingContainer = styled(Row)`
  width: 100%;
  height: 100%;
`

export const LoadingBody = styled.div`
  display: flex;
  width: ${LOADER_SIZE};
  height: ${LOADER_SIZE};
  margin: auto;
  position: relative;
`

export const LoadingSpinner = styled(Loader)`
  width: ${LOADER_SIZE};
  height: ${LOADER_SIZE};
`

export const LoadingIcon = styled(RiImage)`
  position: absolute;
  width: ${({ theme }) => theme.core.icon.size.XL};
  height: ${({ theme }) => theme.core.icon.size.XL};
  top: ${({ theme }) => theme.core.space.space150};
  left: ${({ theme }) => theme.core.space.space150};
`

export const LoadingRiIcon = styled(RiIcon)`
  position: absolute;
  width: ${({ theme }) => theme.core.icon.size.XL};
  height: ${({ theme }) => theme.core.icon.size.XL};
  top: ${({ theme }) => theme.core.space.space150};
  left: ${({ theme }) => theme.core.space.space150};
`
