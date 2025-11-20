import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import {
  IRdiPipelineStatus,
  PipelineState,
  PipelineStatus,
} from 'uiSrc/slices/interfaces'

export const rdiPipelineStatusFactory = Factory.define<IRdiPipelineStatus>(
  () => ({
    rdiVersion: faker.system.semver(),
    address: `${faker.internet.ip()}:${faker.internet.port()}`,
    runStatus: faker.helpers.arrayElement([
      PipelineStatus.Validating,
      PipelineStatus.Starting,
      PipelineStatus.Stopping,
      PipelineStatus.Resetting,
      PipelineStatus.Ready,
      PipelineStatus.NotReady,
      PipelineStatus.Stopped,
    ]),
    syncMode: faker.helpers.arrayElement([
      PipelineState.CDC,
      PipelineState.InitialSync,
      PipelineState.NotRunning,
    ]),
  }),
)
