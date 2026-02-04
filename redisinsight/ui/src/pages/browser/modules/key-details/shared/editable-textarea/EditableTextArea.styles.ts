import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const ContentWrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  align-items: center;
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  min-height: 42px;
  padding-right: 32px;
`

export const EditBtnAnchor = styled.div`
  position: absolute;
  right: 4px;
`

export const TextAreaControls = styled.div``
