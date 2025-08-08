import { MockedRequest, RestHandler } from 'msw'
import instances from './instances'
import content from './content'
import app from './app'
import analytics from './analytics'
import browser from './browser'
import recommendations from './recommendations'
import cloud from './oauth'
import tutorials from './tutorials'
import rdi from './rdi'
import user from './user'
import workbench from './workbench'

// @ts-ignore
export const handlers: RestHandler<MockedRequest>[] = [].concat(
  instances,
  content,
  app,
  analytics,
  browser,
  recommendations,
  cloud,
  tutorials,
  rdi,
  user,
  workbench,
)
