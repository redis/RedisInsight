import { Response } from 'express';
import {
  Controller,
  Get,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';

@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Bulk Actions')
@Controller('bulk-actions')
export class BulkActionsController {
  constructor(private readonly service: BulkActionsService) {}

  @ApiEndpoint({
    description: 'Stream bulk action report as downloadable file',
    statusCode: 200,
  })
  @ApiParam({
    name: 'id',
    description: 'Bulk action id',
    type: String,
  })
  @Get(':id/report/download')
  async downloadReport(
    @Param() { id }: BulkActionIdDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.service.streamReport(id, res);
  }
}

