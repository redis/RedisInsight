import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiConsumes, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { CustomTutorialService } from 'src/modules/custom-tutorial/custom-tutorial.service';
import { UploadCustomTutorialDto } from 'src/modules/custom-tutorial/dto/upload.custom-tutorial.dto';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateCaCertificateDto } from 'src/modules/certificate/dto/create.ca-certificate.dto';
import { UseCaCertificateDto } from 'src/modules/certificate/dto/use.ca-certificate.dto';
import { CreateClientCertificateDto } from 'src/modules/certificate/dto/create.client-certificate.dto';
import { UseClientCertificateDto } from 'src/modules/certificate/dto/use.client-certificate.dto';
import { CreateBasicSshOptionsDto } from 'src/modules/ssh/dto/create.basic-ssh-options.dto';
import { CreateCertSshOptionsDto } from 'src/modules/ssh/dto/create.cert-ssh-options.dto';
import { RootCustomTutorialManifest } from 'src/modules/custom-tutorial/models/custom-tutorial.manifest';
import { RequestSessionMetadata } from 'src/common/decorators';
import { SessionMetadata } from 'src/common/models';

@ApiExtraModels(
  CreateCaCertificateDto,
  UseCaCertificateDto,
  CreateClientCertificateDto,
  UseClientCertificateDto,
  CreateBasicSshOptionsDto,
  CreateCertSshOptionsDto,
)
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Tutorials')
@Controller('/custom-tutorials')
export class CustomTutorialController {
  constructor(private readonly service: CustomTutorialService) {}

  @Post('')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @FormDataRequest()
  @ApiEndpoint({
    description: 'Create new tutorial',
    statusCode: 201,
    responses: [
      {
        type: Object,
      },
    ],
  })
  async create(
    @Body() dto: UploadCustomTutorialDto,
    @RequestSessionMetadata() sessionMetadata: SessionMetadata,
  ): Promise<RootCustomTutorialManifest> {
    return this.service.create(sessionMetadata, dto);
  }

  @Get('manifest')
  @ApiEndpoint({
    description: 'Get global manifest for custom tutorials',
    statusCode: 200,
    responses: [
      {
        type: Object,
      },
    ],
  })
  async getGlobalManifest(): Promise<RootCustomTutorialManifest> {
    return await this.service.getGlobalManifest();
  }

  @Delete('/:id')
  @ApiEndpoint({
    statusCode: 200,
    description: 'Delete custom tutorial and its files',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id);
  }
}
