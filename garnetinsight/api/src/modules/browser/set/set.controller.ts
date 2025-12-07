import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import { ClientMetadata } from 'src/common/models';
import { BrowserClientMetadata } from 'src/modules/browser/decorators/browser-client-metadata.decorator';
import { ApiQueryRedisStringEncoding } from 'src/common/decorators';
import {
  AddMembersToSetDto,
  CreateSetWithExpireDto,
  DeleteMembersFromSetDto,
  DeleteMembersFromSetResponse,
  GetSetMembersDto,
  GetSetMembersResponse,
} from 'src/modules/browser/set/dto';
import { SetService } from 'src/modules/browser/set/set.service';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';

@ApiTags('Browser: Set')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('set')
@UsePipes(new ValidationPipe({ transform: true }))
export class SetController extends BrowserBaseController {
  constructor(private setService: SetService) {
    super();
  }

  @Post('')
  @ApiOperation({ description: 'Set key to hold Set data type' })
  @ApiRedisParams()
  @ApiBody({ type: CreateSetWithExpireDto })
  @ApiQueryRedisStringEncoding()
  async createSet(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: CreateSetWithExpireDto,
  ): Promise<void> {
    return await this.setService.createSet(clientMetadata, dto);
  }

  // The key name can be very large, so it is better to send it in the request body
  @Post('/get-members')
  @HttpCode(200)
  @ApiOperation({
    description:
      'Get specified members of the set stored at key by cursor position',
  })
  @ApiRedisParams()
  @ApiOkResponse({
    description: 'Specified members of the set stored at key.',
    type: GetSetMembersResponse,
  })
  @ApiQueryRedisStringEncoding()
  async getMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: GetSetMembersDto,
  ): Promise<GetSetMembersResponse> {
    return await this.setService.getMembers(clientMetadata, dto);
  }

  @Put('')
  @ApiOperation({
    description: 'Add the specified members to the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: AddMembersToSetDto })
  @ApiQueryRedisStringEncoding()
  async addMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: AddMembersToSetDto,
  ): Promise<void> {
    return await this.setService.addMembers(clientMetadata, dto);
  }

  @Delete('/members')
  @ApiOperation({
    description: 'Remove the specified members from the Set stored at key',
  })
  @ApiRedisParams()
  @ApiBody({ type: DeleteMembersFromSetDto })
  @ApiQueryRedisStringEncoding()
  async deleteMembers(
    @BrowserClientMetadata() clientMetadata: ClientMetadata,
    @Body() dto: DeleteMembersFromSetDto,
  ): Promise<DeleteMembersFromSetResponse> {
    return await this.setService.deleteMembers(clientMetadata, dto);
  }
}
