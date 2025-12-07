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
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

@ApiTags('TLS Certificates')
@Controller('certificates/client')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class ClientCertificateController {
  constructor(private service: ClientCertificateService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  @ApiOperation({ description: 'Get Client Certificate list' })
  @ApiOkResponse({
    description: 'Client Certificate list',
    isArray: true,
    type: ClientCertificate,
  })
  async getClientCertList(): Promise<ClientCertificate[]> {
    return await this.service.list();
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete Client Certificate pair by id' })
  @ApiParam({ name: 'id', type: String })
  async deleteClientCertificatePair(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
