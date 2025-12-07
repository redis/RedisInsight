import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ExpirationGroupsView from './ExpirationGroupsView'

describe('ExpirationGroupsView', () => {
  it('should be rendered', async () => {
    expect(
      render(
        <ExpirationGroupsView data={null} extrapolation={1} loading={false} />,
      ),
    ).toBeTruthy()
  })

  it('should render spinner if loading=true and data=null', async () => {
    const { queryByTestId } = render(
      <ExpirationGroupsView data={null} extrapolation={1} loading />,
    )

    expect(queryByTestId('summary-per-ttl-loading')).toBeInTheDocument()
    expect(queryByTestId('analysis-ttl')).not.toBeInTheDocument()
  })
})
