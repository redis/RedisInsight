import { RdiUrl } from 'src/modules/rdi/constants';
import { sign } from 'jsonwebtoken';
import { Joi, nock } from '../../../helpers/test';
import { describe, expect, deps, getMainCheckFn } from '../../deps';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTEST_statistics';
const notExistedRdiId = 'notExisted';
const testRdiUrl = 'http://rdilocal.test';

const endpoint = (id: string) => {
  return request(server).get(`/${constants.API.RDI}/${id || testRdiId}/statistics`);
};

// Mock response in the OLD format (what RDI API returns)
const mockRdiApiResponse = {
  rdi_pipeline_status: {
    rdi_version: '1.0.0',
    address: 'redis://localhost:6379',
    run_status: 'running',
    sync_mode: 'streaming',
  },
  processing_performance: {
    total_batches: 100,
    batch_size_avg: 1.5,
  },
  connections: {
    target1: {
      status: 'connected',
      type: 'redis',
      host: 'localhost',
      port: 6379,
      database: 'db1',
      user: 'user1',
    },
  },
  data_streams: {
    totals: { total: 300, last_arrival: '' },
    streams: {
      stream1: { total: 100, last_arrival: '2024-01-15T10:30:00Z' },
      stream2: { total: 200, last_arrival: '2024-01-16T11:45:00Z' },
    },
  },
  clients: {
    client1: { id: 'c1', addr: '127.0.0.1' },
  },
};

// Expected response in the NEW format (what our API returns after transformation)
const expectedTransformedResponse = {
  sections: [
    {
      name: 'General info',
      view: 'info',
      data: [
        { label: 'RDI version', value: '1.0.0' },
        { label: 'RDI database address', value: 'redis://localhost:6379' },
        { label: 'Run status', value: 'running' },
        { label: 'Sync mode', value: 'streaming' },
      ],
    },
    {
      name: 'Processing performance information',
      view: 'blocks',
      data: [
        { label: 'Total batches', value: 100, units: 'Total' },
        { label: 'Batch size average', value: 1.5, units: 'MB' },
      ],
    },
    {
      name: 'Target Connections',
      view: 'table',
      columns: [
        { id: 'status', header: 'Status', type: 'status' },
        { id: 'name', header: 'Name' },
        { id: 'type', header: 'Type' },
        { id: 'host_port', header: 'Host:port' },
        { id: 'database', header: 'Database' },
        { id: 'user', header: 'Username' },
      ],
      data: [
        {
          status: 'connected',
          name: 'target1',
          type: 'redis',
          host_port: 'localhost:6379',
          database: 'db1',
          user: 'user1',
        },
      ],
    },
    {
      name: 'Data Streams',
      view: 'table',
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'total', header: 'Total' },
        { id: 'last_arrival', header: 'Last arrival', type: 'date' },
      ],
      data: [
        { name: 'stream1', total: 100, last_arrival: '2024-01-15T10:30:00Z' },
        { name: 'stream2', total: 200, last_arrival: '2024-01-16T11:45:00Z' },
      ],
      footer: { name: 'Total', total: 300, last_arrival: '' },
    },
    {
      name: 'Clients',
      view: 'table',
      columns: [
        { id: 'id', header: 'ID' },
        { id: 'addr', header: 'ADDR' },
      ],
      data: [{ id: 'c1', addr: '127.0.0.1' }],
    },
  ],
};

const statisticsColumnSchema = Joi.object().keys({
  id: Joi.string().required(),
  header: Joi.string().required(),
  type: Joi.string().valid('status', 'date').optional(),
});

const statisticsTableSectionSchema = Joi.object().keys({
  name: Joi.string().required(),
  view: Joi.string().valid('table').required(),
  columns: Joi.array().items(statisticsColumnSchema).required(),
  data: Joi.array().items(Joi.object()).required(),
  footer: Joi.object().optional(),
});

const statisticsBlockItemSchema = Joi.object().keys({
  label: Joi.string().required(),
  value: Joi.number().required(),
  units: Joi.string().required(),
});

const statisticsBlocksSectionSchema = Joi.object().keys({
  name: Joi.string().required(),
  view: Joi.string().valid('blocks').required(),
  data: Joi.array().items(statisticsBlockItemSchema).required(),
});

const statisticsInfoItemSchema = Joi.object().keys({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

const statisticsInfoSectionSchema = Joi.object().keys({
  name: Joi.string().required(),
  view: Joi.string().valid('info').required(),
  data: Joi.array().items(statisticsInfoItemSchema).required(),
});

const statisticsSectionSchema = Joi.alternatives().try(
  statisticsTableSectionSchema,
  statisticsBlocksSectionSchema,
  statisticsInfoSectionSchema,
);

const responseSchema = Joi.object()
  .keys({
    status: Joi.string().valid('success', 'failed').required(),
    data: Joi.object()
      .keys({
        sections: Joi.array().items(statisticsSectionSchema).required(),
      })
      .optional(),
    error: Joi.string().optional(),
  })
  .required()
  .strict(true);

const mockedAccessToken = sign(
  { exp: Math.trunc(Date.now() / 1000) + 3600 },
  'test',
);
nock(testRdiUrl).post(`/${RdiUrl.Login}`).query(true).reply(200, {
  access_token: mockedAccessToken,
});

const mainCheckFn = getMainCheckFn(endpoint);

describe('GET /rdi/:id/statistics/', () => {
  [
    {
      name: 'Should be success if rdi with :id is in db and client GetStatistics succeeds',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          status: 'success',
          data: expectedTransformedResponse,
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetStatistics}`)
          .query(true)
          .reply(200, mockRdiApiResponse);
      },
    },
    {
      name: 'Should throw notFoundError if rdi with id in params does not exist',
      endpoint: () => endpoint(notExistedRdiId),
      statusCode: 404,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          error: 'Not Found',
          message: 'Invalid rdi instance id.',
          statusCode: 404,
        });
      },
      before: async () => {
        expect(await localDb.getRdiById(notExistedRdiId)).to.eql(null);
      },
    },
    {
      name: 'Should not throw error even if client GetStatistics will not succeed',
      responseSchema,
      statusCode: 200,
      checkFn: ({ body }) => {
        expect(body).to.eql({
          status: 'failed',
          error: 'Request failed with status code 401',
        });
      },
      before: async () => {
        await localDb.generateRdis({ id: testRdiId, url: testRdiUrl }, 1);
        nock(testRdiUrl)
          .get(`/${RdiUrl.GetStatistics}`)
          .query(true)
          .reply(401, {
            message: 'Request failed with status code 401',
          });
      },
    },
  ].forEach(mainCheckFn);
});
