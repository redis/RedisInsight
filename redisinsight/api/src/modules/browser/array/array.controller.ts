import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrowserSerializeInterceptor } from 'src/common/interceptors';
import { BrowserBaseController } from 'src/modules/browser/browser.base.controller';
import { ArrayService } from 'src/modules/browser/array/array.service';

@ApiTags('Browser: Array')
@UseInterceptors(BrowserSerializeInterceptor)
@Controller('array')
@UsePipes(new ValidationPipe({ transform: true }))
export class ArrayController extends BrowserBaseController {
  constructor(private arrayService: ArrayService) {
    super();
  }
}
