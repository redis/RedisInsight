import { describe, expect, deps, getMainCheckFn } from '../deps';

const { localDb, request, server, constants } = deps;

const testRdiId = 'someTestId';
const testRdiId2 = 'someTestId_2';

const endpoint = () => request(server).delete(`/${constants.API.RDI}/`);

const validInputData = {
  ids: [testRdiId, testRdiId2],
};

const mainCheckFn = getMainCheckFn(endpoint);

describe('DELETE /rdi', () => {
  describe('Common', () => {
    [
      {
        name: 'Should throw error if ids are empty',
        data: { ids: [] },
        statusCode: 500,
      },
      {
        name: 'Should delete multiple rdis by ids',
        data: validInputData,
        statusCode: 200,
        before: async () => {
          await localDb.generateRdis({ id: testRdiId }, 1);
          await localDb.generateRdis({ id: testRdiId2 }, 1);
          const rdi1 = await localDb.getRdiById(testRdiId);
          const rdi2 = await localDb.getRdiById(testRdiId2);
          expect(rdi1.id).to.eql(testRdiId);
          expect(rdi2.id).to.eql(testRdiId2);
        },
        after: async () => {
          expect(await localDb.getRdiById(testRdiId)).to.eql(null);
          expect(await localDb.getRdiById(testRdiId2)).to.eql(null);
        },
      },
      {
        name: 'Should not throw error even if id does not exist',
        data: { ids: ['Not_existed'] },
        statusCode: 200,
        before: async () => {
          expect(await localDb.getRdiById('Not_existed')).to.eql(null);
        },
      },
    ].forEach(mainCheckFn);
  });
});
