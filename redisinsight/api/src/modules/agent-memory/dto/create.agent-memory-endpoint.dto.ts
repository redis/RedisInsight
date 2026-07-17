import { OmitType } from '@nestjs/swagger';
import { AgentMemoryEndpoint } from 'src/modules/agent-memory/models';

export class CreateAgentMemoryEndpointDto extends OmitType(
  AgentMemoryEndpoint,
  ['id', 'lastConnection'] as const,
) {}
