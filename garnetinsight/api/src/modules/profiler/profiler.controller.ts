import { Response } from 'express';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogFileProvider } from 'src/modules/profiler/providers/log-file.provider';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';

@ApiTags('Profiler')
@Controller('profiler')
export class ProfilerController {
  constructor(private logFileProvider: LogFileProvider) {}

  @ApiEndpoint({
    description: 'Endpoint do download profiler log file',
    statusCode: 200,
  })
  @Get('/logs/:id')
  async downloadLogsFile(@Res() res: Response, @Param('id') id: string) {
    const { stream, filename } = await this.logFileProvider.getDownloadData(id);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment;filename="${filename}.txt"`,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    stream.on('error', () => res.status(404).send()).pipe(res);
  }
}
