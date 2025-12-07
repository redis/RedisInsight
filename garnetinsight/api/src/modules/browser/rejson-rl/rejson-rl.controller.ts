import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GetRejsonRlDto,
  GetRejsonRlResponseDto,
  CreateRejsonRlWithExpireDto,
  ModifyRejsonRlSetDto,
  ModifyRejsonRlArrAppendDto,
  RemoveRejsonRlDto,
  RemoveRejsonRlResponse,
} from 'src/modules/browser/rejson-rl/dto';
import { RejsonRlService } from 'src/modules/browser/rejson-rl/rejson-rl.service';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ClientMetadata } from 'src/common/models';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: REJSON-RL')
@Controller('rejson-rl')
@UsePipes(new ValidationPipe({ transform: true }))
export class RejsonRlController extends BrowserBaseController {
  constructor(private service: RejsonRlService) {
    super();
  }

  @Post('/get')
  @ApiRedisInstanceOperation({
    description: 'Get json properties by path',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description:
          'Download full data by path or returns description of data inside',
        type: GetRejsonRlResponseDto,
      },
    ],
  })
  async getJson(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetRejsonRlDto,
  ): Promise<GetRejsonRlResponseDto> {
    return this.service.getJson(clientMetadata, dto);
  }

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create new REJSON-RL data type',
    statusCode: 201,
  })
  async createJson(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateRejsonRlWithExpireDto,
  ): Promise<void> {
    return this.service.create(clientMetadata, dto);
  }

  @Patch('/set')
  @ApiRedisInstanceOperation({
    description: 'Modify REJSON-RL data type by path',
    statusCode: 200,
  })
  async jsonSet(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: ModifyRejsonRlSetDto,
  ): Promise<void> {
    return this.service.jsonSet(clientMetadata, dto);
  }

  @Patch('/arrappend')
  @ApiRedisInstanceOperation({
    description: 'Append item inside REJSON-RL array',
    statusCode: 200,
  })
  async arrAppend(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: ModifyRejsonRlArrAppendDto,
  ): Promise<void> {
    return this.service.arrAppend(clientMetadata, dto);
  }

  @Delete('')
  @ApiRedisInstanceOperation({
    description: 'Removes path in the REJSON-RL',
    statusCode: 200,
  })
  async remove(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: RemoveRejsonRlDto,
  ): Promise<RemoveRejsonRlResponse> {
    return this.service.remove(clientMetadata, dto);
  }
}
