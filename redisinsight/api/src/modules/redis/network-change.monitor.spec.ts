import * as os from 'os';
import { Test, TestingModule } from '@nestjs/testing';
import { NetworkChangeMonitor } from 'src/modules/redis/network-change.monitor';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

describe('NetworkChangeMonitor', () => {
  let monitor: NetworkChangeMonitor;
  let storage: { removeAll: jest.Mock };
  let interfacesSpy: jest.SpyInstance;

  const ifacesA: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
    lo0: [
      {
        address: '127.0.0.1',
        netmask: '255.0.0.0',
        family: 'IPv4',
        mac: '00:00:00:00:00:00',
        internal: true,
        cidr: '127.0.0.1/8',
      },
    ],
    en0: [
      {
        address: '192.168.1.10',
        netmask: '255.255.255.0',
        family: 'IPv4',
        mac: 'aa:bb:cc:dd:ee:ff',
        internal: false,
        cidr: '192.168.1.10/24',
      },
    ],
  };

  const ifacesB: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
    lo0: ifacesA.lo0,
    en1: [
      {
        address: '10.0.0.5',
        netmask: '255.255.255.0',
        family: 'IPv4',
        mac: '11:22:33:44:55:66',
        internal: false,
        cidr: '10.0.0.5/24',
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    storage = { removeAll: jest.fn().mockResolvedValue(0) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworkChangeMonitor,
        { provide: RedisClientStorage, useValue: storage },
      ],
    }).compile();

    monitor = module.get(NetworkChangeMonitor);
    interfacesSpy = jest.spyOn(os, 'networkInterfaces');
  });

  afterEach(() => {
    monitor.onModuleDestroy();
    interfacesSpy.mockRestore();
  });

  it('does not drop clients when interfaces have not changed', async () => {
    interfacesSpy.mockReturnValue(ifacesA);
    monitor.onModuleInit();
    await monitor['check']();
    expect(storage.removeAll).not.toHaveBeenCalled();
  });

  it('drops all clients when the interface set changes', async () => {
    interfacesSpy.mockReturnValue(ifacesA);
    monitor.onModuleInit();

    interfacesSpy.mockReturnValue(ifacesB);
    await monitor['check']();

    expect(storage.removeAll).toHaveBeenCalledTimes(1);
  });

  it('ignores IPv6 link-local address churn', async () => {
    const withLinkLocalA: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
      en0: [
        ...ifacesA.en0!,
        {
          address: 'fe80::aaaa',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'aa:bb:cc:dd:ee:ff',
          scopeid: 4,
          internal: false,
          cidr: 'fe80::aaaa/64',
        },
      ],
    };
    const withLinkLocalB: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
      en0: [
        ...ifacesA.en0!,
        {
          address: 'fe80::bbbb',
          netmask: 'ffff:ffff:ffff:ffff::',
          family: 'IPv6',
          mac: 'aa:bb:cc:dd:ee:ff',
          scopeid: 4,
          internal: false,
          cidr: 'fe80::bbbb/64',
        },
      ],
    };

    interfacesSpy.mockReturnValue(withLinkLocalA);
    monitor.onModuleInit();

    interfacesSpy.mockReturnValue(withLinkLocalB);
    await monitor['check']();

    expect(storage.removeAll).not.toHaveBeenCalled();
  });

  it('swallows errors thrown by removeAll', async () => {
    interfacesSpy.mockReturnValue(ifacesA);
    monitor.onModuleInit();

    storage.removeAll.mockRejectedValueOnce(new Error('boom'));
    interfacesSpy.mockReturnValue(ifacesB);

    await expect(monitor['check']()).resolves.toBeUndefined();
  });

  it('retries on the next tick when removeAll fails', async () => {
    interfacesSpy.mockReturnValue(ifacesA);
    monitor.onModuleInit();

    storage.removeAll.mockRejectedValueOnce(new Error('boom'));
    interfacesSpy.mockReturnValue(ifacesB);
    await monitor['check']();
    expect(storage.removeAll).toHaveBeenCalledTimes(1);

    // interfaces are still in the "new" state; signature wasn't committed,
    // so the next tick should attempt the disconnect again.
    storage.removeAll.mockResolvedValueOnce(0);
    await monitor['check']();
    expect(storage.removeAll).toHaveBeenCalledTimes(2);

    // once it succeeds, the signature is committed and no further attempts.
    await monitor['check']();
    expect(storage.removeAll).toHaveBeenCalledTimes(2);
  });
});
