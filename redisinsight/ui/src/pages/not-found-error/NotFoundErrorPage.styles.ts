import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export const PageContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
`

export const ContentGroup = styled(Col).attrs({
  align: 'start',
})`
  position: absolute;
  top: 80px;
  left: 80px;
  z-index: 1;
`

export const LogoIcon = styled(RiIcon).attrs({
  type: 'RedisLogoFullIcon',
  size: 'original',
})`
  width: 128px;
  height: 100%;
`

export const ErrorSubtext = styled.p`
  margin-top: 1.4rem;
`

export const RobotHolder = styled.div`
  position: absolute;
  bottom: 0;
  right: 100px;
  z-index: 0;
  height: calc(100vh - 80px);
  width: auto;

  @media (min-width: 1500px) {
    right: 15%;
  }

  @media (max-width: 1000px) {
    height: max(calc(100vh - 200px), 300px);
  }

  @media (max-width: 800px) {
    height: max(calc(100vh - 300px), 300px);
  }

  @media (max-width: 600px) {
    height: max(calc(100vh - 400px), 300px);
  }
`

export const Robot = styled.svg`
  height: 100%;
  width: auto;
`
