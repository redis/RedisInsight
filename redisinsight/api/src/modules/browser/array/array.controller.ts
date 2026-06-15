import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import { ClientMetadata } from 'src/common/models';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { ArrayService } from 'src/modules/browser/array/array.service';
import { CreateArrayWithExpireDto } from 'src/modules/browser/array/dto';

@ApiTags('Browser: Array')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('array')
@UsePipes(new ValidationPipe({ transform: true }))
export class ArrayController extends BrowserBaseController {
  constructor(private arrayService: ArrayService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Array data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateArrayWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createArray(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateArrayWithExpireDto,
  ): Promise<void> {
    return this.arrayService.createArray(clientMetadata, dto);
  }
}
