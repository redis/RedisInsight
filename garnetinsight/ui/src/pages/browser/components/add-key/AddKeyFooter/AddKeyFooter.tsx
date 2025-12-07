import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

export interface Props {
  children: React.ReactNode
}

const AddKeyFooter = (props: Props) => {
  const [el] = useState(document.createElement('div'))
  let container: HTMLElement | null

  useEffect(() => {
    // componentDidMount
    container = document.getElementById('formFooterBar')
    if (container) {
      container.appendChild(el)
    }
    // componentWillUnmount
    return () => {
      if (container) {
        container.removeChild(el)
      }
    }
  }, [])

  return ReactDOM.createPortal(props.children, el)
}
export default AddKeyFooter
