import { AgentMemoryEndpoint } from 'src/modules/agent-memory/models';

export abstract class AgentMemoryEndpointRepository {
  /**
   * List of agent memory endpoints (never includes apiKey)
   */
  abstract list(): Promise<AgentMemoryEndpoint[]>;

  /**
   * Get endpoint connection details by id
   */
  abstract get(
    id: string,
    ignoreEncryptionErrors?: boolean,
  ): Promise<AgentMemoryEndpoint | null>;

  /**
   * Create endpoint connection
   */
  abstract create(endpoint: AgentMemoryEndpoint): Promise<AgentMemoryEndpoint>;

  /**
   * Update endpoint connection config
   */
  abstract update(
    id: string,
    endpoint: Partial<AgentMemoryEndpoint>,
  ): Promise<AgentMemoryEndpoint>;

  /**
   * Delete endpoints by ids
   */
  abstract delete(ids: string[]): Promise<void>;
}
