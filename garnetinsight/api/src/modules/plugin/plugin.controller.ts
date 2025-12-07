import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PluginService } from 'src/modules/plugin/plugin.service';
import { PluginsResponse } from 'src/modules/plugin/plugin.response';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';

@ApiTags('Plugins')
@Controller('/plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @ApiEndpoint({
    statusCode: 200,
    description: 'Get list of available plugins',
    responses: [
      {
        status: 200,
        type: PluginsResponse,
      },
    ],
  })
  @Get()
  async getAll(): Promise<PluginsResponse> {
    return this.pluginService.getAll();
  }
}
