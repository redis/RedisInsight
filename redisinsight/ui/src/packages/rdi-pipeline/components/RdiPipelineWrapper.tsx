import React from 'react'
import { useParams } from 'react-router-dom'
import {
  PipelineManagement,
  PipelineProvider,
} from '@rdi-ui-poc/rdi-ui-pipeline'
import { Pages } from 'uiSrc/constants'
import { useRouterNavigation, useRdiServiceImpl } from '../services'

/**
 * Wrapper component that integrates the rdi-ui-pipeline package with RedisInsight.
 *
 * URL structure: /integrate/:rdiInstanceId/pipeline[/:tab]
 *
 * Examples:
 * - /integrate/abc123/pipeline → Pipeline tab (default)
 * - /integrate/abc123/pipeline/metrics → Metrics tab
 *
 * Provides:
 * - basePath: Full path to package entry (e.g., /integrate/abc123/pipeline)
 * - instanceId: From route params
 * - NavigationService: React Router integration
 * - RdiService: Redux store integration
 */
export const RdiPipelineWrapper = () => {
  const { rdiInstanceId = '' } = useParams<{ rdiInstanceId: string }>()
  const navigation = useRouterNavigation()
  const rdiService = useRdiServiceImpl()

  // Full basePath including instanceId - package only handles tabs after this
  const basePath = Pages.rdiPipelinePoc(rdiInstanceId)

  return (
    <PipelineProvider
      basePath={basePath}
      instanceId={rdiInstanceId}
      services={{
        rdi: rdiService,
        navigation,
      }}
    >
      <div style={{ height: '100%', overflow: 'auto' }}>
        <PipelineManagement />
      </div>
    </PipelineProvider>
  )
}
