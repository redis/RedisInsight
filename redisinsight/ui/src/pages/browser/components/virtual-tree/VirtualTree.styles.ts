import styled from 'styled-components'
import { Loader, RiImage } from 'uiSrc/components/base/display'

export const CustomScroll = styled.div`
  height: 100%;
  position: relative;
`

export const LoadingContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
`

export const LoadingBody = styled.div`
  display: flex;
  width: 54px;
  height: 54px;
  margin: auto;
  position: relative;
`

export const LoadingSpinner = styled(Loader)`
  width: 54px;
  height: 54px;
`

export const LoadingIcon = styled(RiImage)`
  position: absolute;
  width: 28px;
  height: 28px;
  top: 12px;
  left: 12px;
`
