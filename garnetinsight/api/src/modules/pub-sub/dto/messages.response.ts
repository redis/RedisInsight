import { IMessage } from 'src/modules/pub-sub/interfaces/message.interface';

export class MessagesResponse {
  messages: IMessage[];

  count: number;
}
