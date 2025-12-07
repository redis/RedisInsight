import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';

@ApiTags('TLS Certificates')
@Controller('certificates/ca')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class CaCertificateController {
  constructor(private service: CaCertificateService) {}

  @Get('')
  @ApiOperation({ description: 'Get Ca Certificate list' })
  @ApiOkResponse({
    description: 'Ca Certificate list',
    isArray: true,
    type: CaCertificate,
  })
  async list(): Promise<CaCertificate[]> {
    return await this.service.list();
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete Ca Certificate by id' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
