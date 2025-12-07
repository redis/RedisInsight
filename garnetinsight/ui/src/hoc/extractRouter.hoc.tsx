import React from 'react'
import * as H from 'history'
import { withRouter } from 'react-router-dom'

interface Props {
  history: H.History
  location: H.Location
  match: any
}

const extractRouter: any = (onRouter: any) => (WrappedComponent: any) =>
  withRouter(
    class extends React.Component<Props> {
      componentDidMount() {
        const { match, location, history }: any = this.props
        const router = { route: { match, location }, history }
        onRouter(router)
      }

      render() {
        return <WrappedComponent {...this.props} />
      }
    },
  )

export default extractRouter
