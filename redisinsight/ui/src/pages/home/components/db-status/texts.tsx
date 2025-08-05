import React from 'react'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'

export const CHECK_CLOUD_DATABASE = (
  <>
    <Title size="XS">Build your app with Redis Cloud</Title>
    <RiSpacer size="s" />
    <div>
      Free trial Cloud DBs auto-delete after 15 days of inactivity.
      <RiSpacer size="s" />
      But not to worry, you can always re-create it to test your ideas.
      <br />
      Includes native support for JSON, Query Engine and more.
    </div>
  </>
)

export const WARNING_WITH_CAPABILITY = (capability: string) => (
  <>
    <Title size="XS">Build your app with {capability}</Title>
    <RiSpacer size="s" />
    <div>
      Hey, remember your interest in {capability}?
      <br />
      Use your free trial Redis Cloud DB to try it.
    </div>
    <RiSpacer size="s" />
    <div>
      <b>Note</b>: Free trial Cloud DBs auto-delete after 15 days of inactivity.
    </div>
  </>
)
export const WARNING_WITHOUT_CAPABILITY = (
  <>
    <Title size="XS">Your free trial Redis Cloud DB is waiting.</Title>
    <RiSpacer size="s" />
    <div>
      Test ideas and build prototypes.
      <br />
      Includes native support for JSON, Query Engine and more.
    </div>
    <RiSpacer size="s" />
    <div>
      <b>Note</b>: Free trial Cloud DBs auto-delete after 15 days of inactivity.
    </div>
  </>
)
