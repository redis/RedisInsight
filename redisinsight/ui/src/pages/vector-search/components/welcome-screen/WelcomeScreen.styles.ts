import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import Eyeglass from 'uiSrc/assets/img/vector-search/Eyeglass.svg'
import EyeglassDark from 'uiSrc/assets/img/vector-search/EyeglassDark.svg'

export const Container = styled(Col)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.core.space.space300};
`

export const Content = styled(Col)`
  position: relative;
  z-index: 1;
  flex-grow: 0;
`

export const FeatureItem = styled(Col)`
  max-width: 320px;
`

export const BackgroundImage = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 490px;
  height: 475px;
  pointer-events: none;
  z-index: 0;
  background-image: url(${({ theme }) =>
    theme.name === 'dark' ? EyeglassDark : Eyeglass});
  background-repeat: no-repeat;
  background-position: bottom right;
  background-size: contain;

  @media (max-width: 900px) {
    opacity: 0.1;
  }
`
