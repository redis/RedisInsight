import { RequestMethod } from '@nestjs/common';

export default {
  server: {
    excludeRoutes: [
      'redis-enterprise/*',
      'redis-sentinel/*',
      { path: 'databases/import' },
      { path: 'databases', method: RequestMethod.POST },
      { path: 'databases', method: RequestMethod.DELETE },
      { path: 'databases/:id', method: RequestMethod.DELETE },
    ],
  },
};
