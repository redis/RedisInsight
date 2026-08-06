import { PartialType } from '@nestjs/swagger';
import { CreateAgentMemoryEndpointDto } from 'src/modules/agent-memory/dto/create.agent-memory-endpoint.dto';

export class UpdateAgentMemoryEndpointDto extends PartialType(
  CreateAgentMemoryEndpointDto,
) {}
