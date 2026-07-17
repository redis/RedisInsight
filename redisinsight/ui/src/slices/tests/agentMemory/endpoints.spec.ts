import reducer, {
  initialState,
  loadEndpoints,
  loadEndpointsSuccess,
  loadEndpointsFailure,
  setConnectedEndpoint,
  setConnectedEndpointSuccess,
  setConnectedEndpointFailure,
  resetConnectedEndpoint,
} from 'uiSrc/slices/agentMemory/endpoints'
import {
  AgentMemoryBackendType,
  AgentMemoryEndpoint,
} from 'uiSrc/slices/interfaces/agentMemory'

const mockEndpoint: AgentMemoryEndpoint = {
  id: 'endpoint-1',
  name: 'Local AMS',
  url: 'http://localhost:8000',
  backendType: AgentMemoryBackendType.Oss,
}

const mockCapabilities = {
  namespaces: true,
  optimizeQuery: true,
  summaryViews: true,
  addEvents: true,
}

describe('agentMemory endpoints slice', () => {
  describe('loadEndpoints', () => {
    it('should set loading=true', () => {
      const nextState = reducer(initialState, loadEndpoints())

      expect(nextState.loading).toEqual(true)
      expect(nextState.error).toEqual('')
    })
  })

  describe('loadEndpointsSuccess', () => {
    it('should store the endpoints and reset loading', () => {
      const state = reducer(initialState, loadEndpoints())
      const nextState = reducer(state, loadEndpointsSuccess([mockEndpoint]))

      expect(nextState.loading).toEqual(false)
      expect(nextState.data).toEqual([mockEndpoint])
    })
  })

  describe('loadEndpointsFailure', () => {
    it('should store the error and reset loading', () => {
      const state = reducer(initialState, loadEndpoints())
      const nextState = reducer(state, loadEndpointsFailure('some error'))

      expect(nextState.loading).toEqual(false)
      expect(nextState.error).toEqual('some error')
    })
  })

  describe('setConnectedEndpoint', () => {
    it('should reset the connected endpoint and set loading', () => {
      const nextState = reducer(initialState, setConnectedEndpoint())

      expect(nextState.connectedEndpoint.loading).toEqual(true)
      expect(nextState.connectedEndpoint.id).toEqual('')
    })
  })

  describe('setConnectedEndpointSuccess', () => {
    it('should store endpoint details and capabilities', () => {
      const state = reducer(initialState, setConnectedEndpoint())
      const nextState = reducer(
        state,
        setConnectedEndpointSuccess({
          endpoint: mockEndpoint,
          capabilities: mockCapabilities,
        }),
      )

      expect(nextState.connectedEndpoint.id).toEqual(mockEndpoint.id)
      expect(nextState.connectedEndpoint.name).toEqual(mockEndpoint.name)
      expect(nextState.connectedEndpoint.capabilities).toEqual(mockCapabilities)
      expect(nextState.connectedEndpoint.loading).toEqual(false)
    })
  })

  describe('setConnectedEndpointFailure', () => {
    it('should store the error', () => {
      const state = reducer(initialState, setConnectedEndpoint())
      const nextState = reducer(
        state,
        setConnectedEndpointFailure('connect failed'),
      )

      expect(nextState.connectedEndpoint.error).toEqual('connect failed')
      expect(nextState.connectedEndpoint.loading).toEqual(false)
    })
  })

  describe('resetConnectedEndpoint', () => {
    it('should reset back to the initial connected endpoint', () => {
      const state = reducer(
        initialState,
        setConnectedEndpointSuccess({
          endpoint: mockEndpoint,
          capabilities: mockCapabilities,
        }),
      )
      const nextState = reducer(state, resetConnectedEndpoint())

      expect(nextState.connectedEndpoint).toEqual(
        initialState.connectedEndpoint,
      )
    })
  })
})
