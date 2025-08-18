import React from 'react'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiTitle } from 'uiBase/text'

export const CHECK_CLOUD_DATABASE = (
  <>
    <RiTitle size="XS">Build your app with Redis Cloud</RiTitle>
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
    <RiTitle size="XS">Build your app with {capability}</RiTitle>
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
    <RiTitle size="XS">Your free trial Redis Cloud DB is waiting.</RiTitle>
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
