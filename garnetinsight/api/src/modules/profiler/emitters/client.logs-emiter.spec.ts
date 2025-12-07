import { mockSocket } from 'src/__mocks__';
import { ClientLogsEmitter } from 'src/modules/profiler/emitters/client.logs-emitter';
import { ProfilerServerEvents } from 'src/modules/profiler/constants';
import * as MockedSocket from 'socket.io-mock';

describe('ClientLogsEmitter', () => {
  let emitter: ClientLogsEmitter;

  beforeEach(() => {
    emitter = new ClientLogsEmitter(mockSocket);
  });

  it('Initialization', () => {
    emitter = new ClientLogsEmitter(mockSocket);
    expect(emitter.id).toEqual(mockSocket.id);
    expect(emitter['client']).toEqual(mockSocket);
  });

  it('Emit', async () => {
    const client = new MockedSocket();
    client['emit'] = jest.fn();

    const items = [1, 2, 3];

    emitter = new ClientLogsEmitter(client);
    await emitter.emit(items);
    expect(emitter['client'].emit).toHaveBeenCalledWith(
      ProfilerServerEvents.Data,
      items,
    );
  });
});
