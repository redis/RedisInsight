import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import {
  cleanup,
  clearStoreActions,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  MOCK_RDI_PIPELINE_DATA,
  MOCK_RDI_PIPELINE_JSON_DATA,
  MOCK_RDI_PIPELINE_STATUS_DATA,
} from 'uiSrc/mocks/data/rdi'
import reducer, {
  initialState,
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
  deployPipeline,
  deployPipelineSuccess,
  deployPipelineFailure,
  getPipelineStrategies,
  getPipelineStrategiesSuccess,
  getPipelineStrategiesFailure,
  setPipelineSchema,
  setChangedFile,
  setChangedFiles,
  deleteChangedFile,
  getPipelineStatus,
  getPipelineStatusSuccess,
  getPipelineStatusFailure,
  fetchRdiPipeline,
  deployPipelineAction,
  fetchRdiPipelineSchema,
  fetchPipelineStrategies,
  fetchConfigTemplate,
  fetchJobTemplate,
  setJobFunctions,
  fetchRdiPipelineJobFunctions,
  getPipelineStatusAction,
  rdiPipelineSelector,
  rdiPipelineStatusSelector,
  resetPipelineAction,
  stopPipelineAction,
  startPipelineAction,
  triggerPipelineAction,
  triggerPipelineActionSuccess,
  triggerPipelineActionFailure,
  rdiPipelineActionSelector,
  setPipelineConfig,
  setPipelineJobs,
  setMonacoJobsSchema,
  setJobNameSchema,
} from 'uiSrc/slices/rdi/pipeline'
import { apiService } from 'uiSrc/services'
import {
  addErrorNotification,
  addInfiniteNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { FileChangeType, PipelineAction } from 'uiSrc/slices/interfaces'
import { parseJMESPathFunctions } from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi pipe slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {} as AnyAction)

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('rdiPipelineSelector', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getPipeline())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        data: MOCK_RDI_PIPELINE_DATA,
        config: MOCK_RDI_PIPELINE_DATA.config,
        jobs: MOCK_RDI_PIPELINE_DATA.jobs,
      }
      // Act
      const nextState = reducer(
        initialState,
        getPipelineSuccess(MOCK_RDI_PIPELINE_DATA),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('setPipelineConfig', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        config: MOCK_RDI_PIPELINE_DATA.config,
      }
      // Act
      const nextState = reducer(
        initialState,
        setPipelineConfig(MOCK_RDI_PIPELINE_DATA.config),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('setPipelineJobs', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        jobs: MOCK_RDI_PIPELINE_DATA.jobs,
      }
      // Act
      const nextState = reducer(
        initialState,
        setPipelineJobs(MOCK_RDI_PIPELINE_DATA.jobs),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getPipelineFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipeline', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, deployPipeline())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipelineSuccess', () => {
    it('should set loading = false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, deployPipelineSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deployPipelineFailure', () => {
    it('should set loading = false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, deployPipelineFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStrategies', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        strategies: {
          ...initialState.strategies,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, getPipelineStrategies())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStrategiesSuccess', () => {
    it('should set loading = false', () => {
      const mockData = [{ strategy: 'ingest', databases: ['oracle'] }]
      // Arrange
      const state = {
        ...initialState,
        strategies: {
          ...initialState.strategies,
          data: mockData,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        getPipelineStrategiesSuccess(mockData),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStrategiesFailure', () => {
    it('should set loading = false', () => {
      const mockError = 'some error'
      // Arrange
      const state = {
        ...initialState,
        strategies: {
          ...initialState.strategies,
          error: mockError,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        getPipelineStrategiesFailure(mockError),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('setChangedFile', () => {
    it('should set change file', () => {
      const mockChangedFile = { name: 'name', status: FileChangeType.Added }
      // Arrange
      const state = {
        ...initialState,
        changes: {
          name: FileChangeType.Added,
        },
      }

      // Act
      const nextState = reducer(initialState, setChangedFile(mockChangedFile))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteChangedFile', () => {
    it('should remove changed file', () => {
      const mockChangedFile = { name: 'name', status: FileChangeType.Added }
      // Arrange
      const state = {
        ...initialState,
        changes: {
          name: FileChangeType.Added,
        },
      }

      // Act
      const nextState = reducer(state, deleteChangedFile(mockChangedFile.name))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setChangedFiles', () => {
    it('should replace changed files', () => {
      const mockChangedFiles1 = { name: FileChangeType.Modified }
      const mockChangedFiles2 = { name: FileChangeType.Removed }

      // Arrange
      const state = {
        ...initialState,
        changes: mockChangedFiles2,
      }

      // Act
      const nextState = reducer(
        { ...initialState, changes: mockChangedFiles1 },
        setChangedFiles(mockChangedFiles2),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('setJobFunctions', () => {
    it('should set job functions as monaco compilation items', () => {
      const summaryValue = 'summary'
      const argumentsValue = [
        {
          name: 'encoded',
          type: 'string',
          display_text: 'base64 encoded string',
          optional: false,
        },
      ]
      const mockData = {
        function: {
          summary: summaryValue,
          arguments: argumentsValue,
        },
      }

      // Arrange
      const state = {
        ...initialState,
        jobFunctions: parseJMESPathFunctions(mockData),
      }

      // Act
      const nextState = reducer(initialState, setJobFunctions(mockData))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStatus', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState.status,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getPipelineStatus())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineStatusSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStatusSuccess', () => {
    it('should proper data', () => {
      const data = MOCK_RDI_PIPELINE_STATUS_DATA
      // Arrange
      const state = {
        ...initialState.status,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, getPipelineStatusSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineStatusSelector(rootState)).toEqual(state)
    })
  })

  describe('getPipelineStatusFailure', () => {
    it('should set error', () => {
      const error = 'some error'
      // Arrange
      const state = {
        ...initialState.status,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getPipelineStatusFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineStatusSelector(rootState)).toEqual(state)
    })
  })

  describe('triggerPipelineAction', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState.pipelineAction,
        loading: true,
        action: PipelineAction.Start,
        error: '',
      }

      // Act
      const nextState = reducer(
        initialState,
        triggerPipelineAction(PipelineAction.Start),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineActionSelector(rootState)).toEqual(state)
    })
  })

  describe('triggerPipelineActionSuccess', () => {
    it('should set loading = true', () => {
      // Arrange
      const state = {
        ...initialState.pipelineAction,
        loading: false,
        error: '',
      }

      // Act
      const nextState = reducer(initialState, triggerPipelineActionSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineActionSelector(rootState)).toEqual(state)
    })
  })

  describe('triggerPipelineActionFailure', () => {
    it('should set loading = true', () => {
      const error = 'Some reset error'
      // Arrange
      const state = {
        ...initialState.pipelineAction,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        triggerPipelineActionFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          pipeline: nextState,
        },
      })
      expect(rdiPipelineActionSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  describe('thunks', () => {
    describe('fetchRdiPipeline', () => {
      it('succeed to fetch data', async () => {
        const data = MOCK_RDI_PIPELINE_JSON_DATA
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipeline('123'))

        // Assert
        const expectedActions = [
          getPipeline(),
          getPipelineSuccess(MOCK_RDI_PIPELINE_DATA),
          setChangedFiles({}),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipeline('123'))

        // Assert
        const expectedActions = [
          getPipeline(),
          addErrorNotification(responsePayload as AxiosError),
          getPipelineFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deployPipelineAction', () => {
      it('succeed to post data', async () => {
        const mockData = { config: {}, jobs: [] }
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deployPipelineAction('123', mockData))

        // Assert
        const expectedActions = [
          deployPipeline(),
          deployPipelineSuccess(),
          setChangedFiles({}),
          addInfiniteNotification(INFINITE_MESSAGES.SUCCESS_DEPLOY_PIPELINE()),
        ]

        expect(clearStoreActions(store.getActions())).toEqual(
          clearStoreActions(expectedActions),
        )
      })

      it('failed to post data', async () => {
        const mockData = { config: {}, jobs: [] }
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deployPipelineAction('123', mockData))

        // Assert
        const expectedActions = [
          deployPipeline(),
          addErrorNotification(responsePayload as AxiosError),
          deployPipelineFailure(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('resetPipelineAction', () => {
      it('succeed to post data', async () => {
        const cb = jest.fn()
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(resetPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Reset),
          triggerPipelineActionSuccess(),
          addMessageNotification(successMessages.SUCCESS_RESET_PIPELINE()),
        ]

        expect(clearStoreActions(store.getActions())).toEqual(
          clearStoreActions(expectedActions),
        )
      })

      it('failed to post data', async () => {
        const cb = jest.fn()
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(resetPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Reset),
          addErrorNotification(responsePayload as AxiosError),
          triggerPipelineActionFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('stopPipelineAction', () => {
      it('succeed to post data', async () => {
        const cb = jest.fn()
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(stopPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Stop),
          triggerPipelineActionSuccess(),
        ]

        expect(clearStoreActions(store.getActions())).toEqual(
          clearStoreActions(expectedActions),
        )
      })

      it('failed to post data', async () => {
        const cb = jest.fn()
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(stopPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Stop),
          addErrorNotification(responsePayload as AxiosError),
          triggerPipelineActionFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('startPipelineAction', () => {
      it('succeed to post data', async () => {
        const cb = jest.fn()
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(startPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Start),
          triggerPipelineActionSuccess(),
        ]

        expect(clearStoreActions(store.getActions())).toEqual(
          clearStoreActions(expectedActions),
        )
      })

      it('failed to post data', async () => {
        const cb = jest.fn()
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(startPipelineAction('123', cb, cb))

        // Assert
        const expectedActions = [
          triggerPipelineAction(PipelineAction.Start),
          addErrorNotification(responsePayload as AxiosError),
          triggerPipelineActionFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRdiPipelineSchema', () => {
      it('succeed to fetch data with minimal schema', async () => {
        const data = { config: 'string' }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineSchema('123'))

        // Assert
        const expectedActions = [
          setPipelineSchema(data),
          setMonacoJobsSchema({ required: [] }),
          setJobNameSchema(null),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('succeed to fetch data with complete jobs schema', async () => {
        const data = {
          config: 'string',
          jobs: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
              },
              source: {
                type: 'object',
                properties: {
                  server_name: { type: 'string' },
                  schema: { type: 'string' },
                  table: { type: 'string' }
                }
              }
            },
            required: ['name', 'source']
          }
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineSchema('123'))

        // Assert
        const expectedMonacoJobsSchema = {
          type: 'object',
          properties: {
            source: {
              type: 'object',
              properties: {
                server_name: { type: 'string' },
                schema: { type: 'string' },
                table: { type: 'string' }
              }
            }
          },
          required: ['source'] // 'name' is filtered out
        }

        const expectedJobNameSchema = {
          type: 'string',
          pattern: '^[a-zA-Z][a-zA-Z0-9_]*$'
        }

        const expectedActions = [
          setPipelineSchema(data),
          setMonacoJobsSchema(expectedMonacoJobsSchema),
          setJobNameSchema(expectedJobNameSchema),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('succeed to fetch data with jobs schema but no name property', async () => {
        const data = {
          config: 'string',
          jobs: {
            type: 'object',
            properties: {
              source: { type: 'object' },
              transform: { type: 'array' }
            },
            required: ['source', 'transform']
          }
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineSchema('123'))

        // Assert
        const expectedMonacoJobsSchema = {
          type: 'object',
          properties: {
            source: { type: 'object' },
            transform: { type: 'array' }
          },
          required: ['source', 'transform']
        }

        const expectedActions = [
          setPipelineSchema(data),
          setMonacoJobsSchema(expectedMonacoJobsSchema),
          setJobNameSchema(null), // default fallback value
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('succeed to fetch data with empty jobs schema', async () => {
        const data = {
          config: 'string',
          jobs: {}
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineSchema('123'))

        // Assert
        const expectedActions = [
          setPipelineSchema(data),
          setMonacoJobsSchema({ required: [] }),
          setJobNameSchema(null),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineSchema('123'))

        // Assert
        const expectedActions = [setPipelineSchema(null)]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRdiPipelineJobFunctions', () => {
      it('succeed to fetch data', async () => {
        const data = { function: { summary: 'summary', arguments: [] } }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineJobFunctions('123'))

        // Assert
        const expectedActions = [setJobFunctions(data)]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRdiPipelineJobFunctions('123'))

        expect(store.getActions().length).toEqual(0)
      })
    })

    describe('fetchPipelineStrategies', () => {
      it('succeed to fetch data', async () => {
        const data = {
          strategies: [{ strategy: 'ingest', databases: ['oracle'] }],
        }

        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPipelineStrategies('123'))

        // Assert
        const expectedActions = [
          getPipelineStrategies(),
          getPipelineStrategiesSuccess(data.strategies),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPipelineStrategies('123'))

        // Assert
        const expectedActions = [
          getPipelineStrategies(),
          getPipelineStrategiesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchJobTemplate', () => {
      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchJobTemplate('123', 'db_type'))

        // Assert
        const expectedActions = [
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchConfigTemplate', () => {
      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchConfigTemplate('123', 'ingest', 'db_type'),
        )

        // Assert
        const expectedActions = [
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getPipelineStatusAction', () => {
      it('succeed to fetch data', async () => {
        const data = MOCK_RDI_PIPELINE_STATUS_DATA
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(getPipelineStatusAction('123'))

        // Assert
        const expectedActions = [
          getPipelineStatus(),
          getPipelineStatusSuccess(MOCK_RDI_PIPELINE_STATUS_DATA),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(getPipelineStatusAction('123'))

        // Assert
        const expectedActions = [
          getPipelineStatus(),
          getPipelineStatusFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
