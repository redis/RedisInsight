import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import {
  SetStringDto,
  GetStringValueResponse,
  SetStringWithExpireDto,
  GetStringInfoDto,
} from 'src/modules/browser/string/dto';
import { GetKeyInfoDto } from 'src/modules/browser/keys/dto';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { ApiEndpoint } from 'src/decorators/api-endpoint.decorator';
import { Response } from 'express';
import { StringService } from 'src/modules/browser/string/string.service';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: String')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('string')
@UsePipes(new ValidationPipe({ transform: true }))
export class StringController extends BrowserBaseController {
  constructor(private stringService: StringService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold string value' })
  @ApiRedisParams()
  @ApiBody({ type: SetStringWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async setString(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetStringWithExpireDto,
  ): Promise<void> {
    throw new Error('Test error');
    return this.stringService.setString(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-value')
  @HttpCode(200)
  @ApiOperation({ description: 'Get string value' })
  @ApiRedisParams()
  @ApiBody({ type: GetStringInfoDto })
  @ApiOkResponse({
    description: 'String value',
    type: GetStringValueResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getStringValue(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetStringInfoDto,
  ): Promise<GetStringValueResponse> {
    return this.stringService.getStringValue(clientMetadata, dto);
  }

  @ApiEndpoint({
    description: 'Endpoint do download string value',
    statusCode: 200,
  })
  @Post('/download-value')
  @ApiRedisParams()
  @ApiBody({ type: GetKeyInfoDto })
  @ApiQueryRedisStringEncoding()
  async downloadStringFile(
    @Res() res: Response,
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetKeyInfoDto,
  ): Promise<void> {
    const { stream } = await this.stringService.downloadStringValue(
      clientMetadata,
      dto,
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment;filename="string_value"');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    stream.on('error', () => res.status(404).send()).pipe(res);
  }

  @Put('')
  @ApiOperation({ description: 'Update string value' })
  @ApiRedisParams()
  @ApiBody({ type: SetStringDto })
  @ApiQueryRedisStringEncoding()
  async updateStringValue(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: SetStringDto,
  ): Promise<void> {
    return this.stringService.updateStringValue(clientMetadata, dto);
  }
}
