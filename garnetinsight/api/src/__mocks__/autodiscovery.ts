export const mockWinNetstat =
  '' +
  'Proto  Local Address          Foreign Address        State           PID\n' +
  'TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING       13728\n' +
  'TCP    0.0.0.0:6379           0.0.0.0:0              LISTENING       13728\n' +
  'TCP    127.0.0.1:6379         0.0.0.0:0              LISTENING       13728\n' +
  'TCP    *:6380                 0.0.0.0:0              LISTENING       13728\n' +
  'TCP    [::]:135               [::]:0                 LISTENING       1100\n' +
  'TCP    [::]:445               [::]:0                 LISTENING       4\n' +
  'TCP    [::]:808               [::]:0                 LISTENING       6084\n' +
  'TCP    [::]:2701              [::]:0                 LISTENING       6056\n' +
  'TCP    [::]:5000              [::]:0                 LISTENING       6056\n' +
  'TCP                           *:*                    LISTENING       6056';

export const mockLinuxNetstat =
  '' +
  'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    \n' +
  'tcp        0      0 0.0.0.0:5000            0.0.0.0:*               LISTEN      -                   \n' +
  'tcp        0      0 0.0.0.0:6379            0.0.0.0:*               LISTEN      -                   \n' +
  'tcp        0      0 127.0.0.1:6379          0.0.0.0:*               LISTEN      -                   \n' +
  'tcp        0      0 *:6380                  0.0.0.0:*               LISTEN      -                   \n' +
  'tcp6       0      0 :::28100                :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 :::8100                 :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 :::8101                 :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 :::8102                 :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 :::8103                 :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 :::8200                 :::*                    LISTEN      -                   \n' +
  'tcp6       0      0 ::1:6379                :::*                    LISTEN      -                   \n';

/* eslint-disable max-len */
export const mockMacNetstat =
  '' +
  'Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)     rhiwat shiwat    pid   epid  state    options\n' +
  'tcp4       0      0  10.55.1.235.5000       10.55.1.235.52217      FIN_WAIT_2  407280 146988  30555      0 0x2131 0x00000104\n' +
  'tcp4       0      0  10.55.1.235.6379       10.55.1.235.5001       CLOSE_WAIT  407682 146988    872      0 0x0122 0x00000008\n' +
  'tcp4       0      0  127.0.0.1.6379         127.0.0.1.52216        FIN_WAIT_2  403346 146988  24687      0 0x2131 0x00000104\n' +
  'tcp46      0      0  *.6380                 *.*                    LISTEN      131072 131072  31195      0 0x0100 0x00000106\n' +
  'tcp6       0      0  ::1.5002               ::1.52167              ESTABLISHED 405692 146808  31195      0 0x0102 0x00000104\n' +
  'tcp6       0      0  ::1.52167              ::1.5002               ESTABLISHED 406172 146808  31200      0 0x0102 0x00000008\n';
/* eslint-enable max-len */

export const mockAutodiscoveryEndpoint = {
  host: '127.0.0.1',
  port: 6379,
};
