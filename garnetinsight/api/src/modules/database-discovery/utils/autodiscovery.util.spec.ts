import {
  mockLinuxNetstat,
  mockMacNetstat,
  mockWinNetstat,
} from 'src/__mocks__';
import * as os from 'os';
import * as ch from 'child_process';
import * as net from 'net';
import * as events from 'events';
import * as stream from 'stream';
import { ChildProcess } from 'child_process';
import * as autodiscoveryUtility from './autodiscovery.util';

jest.mock('os', () => ({
  ...(jest.requireActual('os') as object),
  __esModule: true,
  type: jest.fn(),
}));

jest.mock('child_process', () => ({
  ...(jest.requireActual('child_process') as object),
  __esModule: true,
  spawn: jest.fn(),
}));

jest.mock('net', () => ({
  ...(jest.requireActual('net') as object),
  __esModule: true,
  createConnection: jest.fn(),
}));

const mockStdout = new events.EventEmitter() as stream.Readable;
const mockChildProcess = new events.EventEmitter() as ChildProcess;
mockChildProcess['stdout'] = mockStdout;

const mockSocket = new events.EventEmitter() as net.Socket;
mockSocket.end = jest.fn();

describe('getSpawnArgs', () => {
  const getSpawnArgsTests = [
    {
      name: 'Linux',
      before: () => (os.type as jest.Mock).mockReturnValue('Linux'),
      output: ['netstat', ['-anpt']],
    },
    {
      name: 'Darwin',
      before: () => (os.type as jest.Mock).mockReturnValue('Darwin'),
      output: ['netstat', ['-anvp', 'tcp']],
    },
    {
      name: 'Windows_NT',
      before: () => (os.type as jest.Mock).mockReturnValue('Windows_NT'),
      output: ['netstat.exe', ['-a', '-n', '-o']],
    },
  ];

  getSpawnArgsTests.forEach((test) => {
    it(`Should return args for ${test.name}`, async () => {
      await test.before();

      const result = autodiscoveryUtility.getSpawnArgs();

      expect(result).toEqual(test.output);
    });
  });
});

describe('getRunningProcesses', () => {
  beforeEach(() => {
    (os.type as jest.Mock).mockReturnValue('Linux');
    (ch.spawn as jest.Mock).mockReturnValue(mockChildProcess);
  });
  const getRunningProcessesTests = [
    {
      name: 'netstat entries array for Linux',
      emit: () => {
        mockStdout.emit('data', mockLinuxNetstat);
        mockStdout.emit('end');
      },
      output: mockLinuxNetstat.split('\n'),
    },
  ];

  getRunningProcessesTests.forEach((test) => {
    it(`Should return ${test.name}`, (done) => {
      autodiscoveryUtility.getRunningProcesses().then((result) => {
        expect(result).toEqual(test.output);
        done();
      });

      test.emit();
    });
  });

  it('Should throw an error for unsupported platform', async () => {
    (os.type as jest.Mock).mockReturnValueOnce('custom_os');

    try {
      await autodiscoveryUtility.getRunningProcesses();
      fail();
    } catch (e) {
      expect(e.message).toEqual('Unsupported operation system');
    }
  });

  it('Should throw an error if child process fail', (done) => {
    autodiscoveryUtility
      .getRunningProcesses()
      .then(() => {
        fail();
      })
      .catch((e) => {
        expect(e.message).toEqual('Child process error');
        done();
      });

    mockChildProcess.emit('error', new Error('Child process error'));
  });
});

describe('getTCPEndpoints', () => {
  const getTCPEndpointsTests = [
    {
      name: 'win output',
      input: mockWinNetstat.split('\n'),
      output: [
        { host: '127.0.0.1', port: 5000 },
        { host: '127.0.0.1', port: 6379 },
        { host: '127.0.0.1', port: 6380 },
        { host: '127.0.0.1', port: 135 },
        { host: '127.0.0.1', port: 445 },
        { host: '127.0.0.1', port: 808 },
        { host: '127.0.0.1', port: 2701 },
      ],
    },
    {
      name: 'linux output',
      input: mockLinuxNetstat.split('\n'),
      output: [
        { host: '127.0.0.1', port: 5000 },
        { host: '127.0.0.1', port: 6379 },
        { host: '127.0.0.1', port: 6380 },
        { host: '127.0.0.1', port: 28100 },
        { host: '127.0.0.1', port: 8100 },
        { host: '127.0.0.1', port: 8101 },
        { host: '127.0.0.1', port: 8102 },
        { host: '127.0.0.1', port: 8103 },
        { host: '127.0.0.1', port: 8200 },
      ],
    },
    {
      name: 'mac output',
      input: mockMacNetstat.split('\n'),
      output: [
        { host: '127.0.0.1', port: 5000 },
        { host: '127.0.0.1', port: 6379 },
        { host: '127.0.0.1', port: 6380 },
        { host: '127.0.0.1', port: 5002 },
        { host: '127.0.0.1', port: 52167 },
      ],
    },
  ];

  getTCPEndpointsTests.forEach((test) => {
    it(`Should return endpoints to test ${test.name}`, async () => {
      const result = autodiscoveryUtility.getTCPEndpoints(test.input);

      expect(result).toEqual(test.output);
    });
  });
});

describe('testEndpoint', () => {
  beforeEach(() => {
    (net.createConnection as jest.Mock).mockReturnValue(mockSocket);
  });
  const testEndpointTests = [
    {
      name: 'endpoint if +PONG received',
      emit: () => {
        mockSocket.emit('data', '+PONG');
      },
      input: { host: 'localhost', port: 5000 },
      output: { host: 'localhost', port: 5000 },
    },
    {
      name: 'null if no +PONG received',
      emit: () => {
        mockSocket.emit('data', 'something else');
      },
      input: { host: 'localhost', port: 5000 },
      output: null,
    },
    {
      name: 'null if error happened',
      emit: () => {
        mockSocket.emit('error', new Error('some error'));
      },
      input: { host: 'localhost', port: 5000 },
      output: null,
    },
    {
      name: 'null if no response in 1s',
      emit: () => {},
      input: { host: 'localhost', port: 5000 },
      output: null,
    },
  ];

  testEndpointTests.forEach((test) => {
    it(`Should return ${test.name}`, (done) => {
      autodiscoveryUtility.testEndpoint(test.input).then((result) => {
        expect(result).toEqual(test.output);
        done();
      });

      test.emit();
    });
  });
});

describe('getAvailableEndpoints', () => {
  beforeEach(() => {
    const getRunningProcessesSpy = jest.spyOn(
      autodiscoveryUtility,
      'getRunningProcesses',
    );
    getRunningProcessesSpy.mockResolvedValue(['']);
    (net.createConnection as jest.Mock).mockReturnValue(mockSocket);
  });
  const getAvailableEndpointsTests = [
    {
      name: 'only available endpoints',
      mock: () => {
        const spy = jest.spyOn(autodiscoveryUtility, 'testEndpoint');
        const getTCPEndpointsSpy = jest.spyOn(
          autodiscoveryUtility,
          'getTCPEndpoints',
        );
        getTCPEndpointsSpy.mockReturnValueOnce([
          { host: 'localhost', port: 5000 },
          { host: 'localhost', port: 5001 },
        ]);
        spy.mockResolvedValueOnce(null);
        spy.mockResolvedValueOnce({ host: 'localhost', port: 5001 });
      },
      output: [{ host: 'localhost', port: 5001 }],
    },
  ];

  getAvailableEndpointsTests.forEach((test) => {
    it(`Should return ${test.name}`, async () => {
      await test.mock();

      const result = await autodiscoveryUtility.getAvailableEndpoints();

      expect(result).toEqual(test.output);
    });
  });
});
