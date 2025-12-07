import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';

@ApiTags('Info')
@Controller('health')
export class HealthController {
  @Get('')
  @ApiEndpoint({
    description: 'Get server info',
    statusCode: 200,
  })
  async health(): Promise<object> {
    return { status: 'up' };
  }
}
