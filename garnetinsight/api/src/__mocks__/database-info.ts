export const mockRedisClientList =
  'id=29 addr=172.17.0.1:60702 laddr=172.17.0.4:6379 fd=20 ' +
  'name=garnetinsight-common-f9d59780 age=319 idle=0 flags=N db=0 sub=0 psub=0 multi=-1 qbuf=26 ' +
  'qbuf-free=40928 argv-mem=10 obl=0 oll=0 omem=0 tot-mem=61466 events=r cmd=client user=default resp=2 redir=-1\n' +
  'id=31 addr=172.17.0.1:63984 laddr=172.17.0.4:6379 fd=22 name=garnetinsight-cli-bc36ecf0 age=15 ' +
  'idle=15 flags=N db=0 sub=0 psub=0 multi=-1 qbuf=0 qbuf-free=0 argv-mem=0 obl=0 oll=0 omem=0 ' +
  'tot-mem=20512 events=r cmd=client user=default redir=-1\n';

export const mockRedisClientListResult = [
  {
    addr: '172.17.0.1:60702',
    age: '319',
    'argv-mem': '10',
    cmd: 'client',
    db: '0',
    events: 'r',
    fd: '20',
    flags: 'N',
    id: '29',
    idle: '0',
    laddr: '172.17.0.4:6379',
    multi: '-1',
    name: 'garnetinsight-common-f9d59780',
    obl: '0',
    oll: '0',
    omem: '0',
    psub: '0',
    qbuf: '26',
    'qbuf-free': '40928',
    redir: '-1',
    sub: '0',
    'tot-mem': '61466',
    user: 'default',
    resp: '2',
  },
  {
    addr: '172.17.0.1:63984',
    age: '15',
    'argv-mem': '0',
    cmd: 'client',
    db: '0',
    events: 'r',
    fd: '22',
    flags: 'N',
    id: '31',
    idle: '15',
    laddr: '172.17.0.4:6379',
    multi: '-1',
    name: 'garnetinsight-cli-bc36ecf0',
    obl: '0',
    oll: '0',
    omem: '0',
    psub: '0',
    qbuf: '0',
    'qbuf-free': '0',
    redir: '-1',
    sub: '0',
    'tot-mem': '20512',
    user: 'default',
  },
];
