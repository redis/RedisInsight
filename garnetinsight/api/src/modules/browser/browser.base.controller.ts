import { UseInterceptors } from '@nestjs/common';
import { TimeoutInterceptor } from 'src/common/interceptors';
import ERROR_MESSAGES from 'src/constants/error-messages';

@UseInterceptors(new TimeoutInterceptor(ERROR_MESSAGES.REQUEST_TIMEOUT))
export class BrowserBaseController {}
