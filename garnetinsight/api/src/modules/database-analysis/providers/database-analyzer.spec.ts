import { DatabaseAnalyzer } from 'src/modules/database-analysis/providers/database-analyzer';
import { Key } from 'src/modules/database-analysis/models';

const keysCount = 100;
let genericTotal = 0;
const numberOfNsp = 20;

export const getGenericTotal = (start: number, end: number) => {
  let total = 0;
  for (let i = start; i <= end; i += 1) {
    total += i;
  }
  return total;
};

export const calculateTypeIdx = (idx: number, perGroup = 25) =>
  Math.trunc(idx / perGroup) + (idx % perGroup === 0 ? 0 : 1);

const shuffleKeys = (keys) => [...keys].sort(() => Math.random() - 0.5);

// 100 keys:
// {
//   name: 'nsp_[1-20]:key_[1-100]',
//   type: 'type_[1-4]',
//   memory: '[1-100]',
//   ttl: -1,
//   length: '[1-100]',
// }
const mockKeys: Key[] = [];
for (let i = 1; i < keysCount; i += numberOfNsp) {
  for (let j = 1; j <= numberOfNsp; j += 1) {
    const idx = j + i - 1;
    genericTotal += idx;
    mockKeys.push({
      name: Buffer.from(`nsp_${calculateTypeIdx(idx)}:key_${idx}`),
      type: `type_${calculateTypeIdx(idx)}`,
      memory: idx,
      ttl: -1,
      length: keysCount - idx + 1,
    });
  }
}

const mockKeysWithNulls = [
  {
    name: 'wo',
    type: 'wo',
    memory: null,
    length: null,
    ttl: null,
  } as Key,
  {
    name: 'wo',
    type: 'type_1',
    memory: null,
    length: null,
    ttl: null,
  } as Key,
  ...mockKeys.slice(0, 2),
];

const mockPartialAnalysis = {
  delimiter: ':',
};

describe('DatabaseAnalyzer', () => {
  const analyzer = new DatabaseAnalyzer();

  describe('calculateSimpleSummary', () => {
    it('should calculate simple summary by memory', async () => {
      const summary = await analyzer.calculateSimpleSummary(
        shuffleKeys(mockKeys),
        'memory',
      );
      expect(summary).toEqual({
        total: genericTotal,
        types: [
          {
            type: 'type_4',
            total: getGenericTotal(76, 100),
          },
          {
            type: 'type_3',
            total: getGenericTotal(51, 75),
          },
          {
            type: 'type_2',
            total: getGenericTotal(26, 50),
          },
          {
            type: 'type_1',
            total: getGenericTotal(1, 25),
          },
        ],
      });
    });
    it('should calculate simple summary by memory (null handled)', async () => {
      const summary = await analyzer.calculateSimpleSummary(
        shuffleKeys(mockKeysWithNulls),
        'memory',
      );
      expect(summary).toEqual({
        total: 3,
        types: [
          {
            type: 'type_1',
            total: 3,
          },
          {
            type: 'wo',
            total: 0,
          },
        ],
      });
    });
    it('should calculate simple summary by keys number', async () => {
      const summary = await analyzer.calculateSimpleSummary(
        shuffleKeys(mockKeys),
        1,
      );
      expect(summary.total).toEqual(keysCount);
      expect(summary.types.length).toEqual(4);
      summary.types.forEach((type) => {
        expect(type.total).toEqual(25);
        expect(
          ['type_1', 'type_2', 'type_3', 'type_4'].includes(type.type),
        ).toEqual(true);
      });
    });
    it('should calculate simple summary by keys number (null handled)', async () => {
      const summary = await analyzer.calculateSimpleSummary(
        shuffleKeys(mockKeysWithNulls),
        1,
      );
      expect(summary).toEqual({
        total: mockKeysWithNulls.length,
        types: [
          {
            type: 'type_1',
            total: 3,
          },
          {
            type: 'wo',
            total: 1,
          },
        ],
      });
    });
  });

  describe('calculateTopKeys', () => {
    it('should calculate top keys by memory', async () => {
      const summary = await analyzer.calculateTopKeys(
        [shuffleKeys(mockKeys)],
        'memory',
      );
      expect(summary).toEqual([...mockKeys].reverse().slice(0, 15));
    });
    it('should calculate top keys by memory (with null)', async () => {
      const summary = await analyzer.calculateTopKeys(
        [mockKeysWithNulls],
        'memory',
      );
      expect(summary).toEqual([
        ...mockKeys.slice(0, 2).reverse(),
        mockKeysWithNulls[0],
        mockKeysWithNulls[1],
      ]);
    });
    it('should calculate top keys by length', async () => {
      const summary = await analyzer.calculateTopKeys(
        [shuffleKeys(mockKeys)],
        'length',
      );
      expect(summary).toEqual(mockKeys.slice(0, 15));
    });
    it('should calculate top keys by length (with null)', async () => {
      const summary = await analyzer.calculateTopKeys(
        [mockKeysWithNulls],
        'length',
      );
      expect(summary).toEqual([
        ...mockKeys.slice(0, 2),
        mockKeysWithNulls[0],
        mockKeysWithNulls[1],
      ]);
    });
  });

  describe('getNamespacesMap', () => {
    it('should get namespaces map', async () => {
      const summary = await analyzer.getNamespacesMap(
        mockKeys,
        mockPartialAnalysis.delimiter,
      );
      expect(summary).toEqual(
        new Map([
          [
            Buffer.from('nsp_1').toString('hex'),
            {
              keys: 25,
              memory: getGenericTotal(1, 25),
              types: new Map([
                ['type_1', { keys: 25, memory: getGenericTotal(1, 25) }],
              ]),
            },
          ],
          [
            Buffer.from('nsp_2').toString('hex'),
            {
              keys: 25,
              memory: getGenericTotal(26, 50),
              types: new Map([
                ['type_2', { keys: 25, memory: getGenericTotal(26, 50) }],
              ]),
            },
          ],
          [
            Buffer.from('nsp_3').toString('hex'),
            {
              keys: 25,
              memory: getGenericTotal(51, 75),
              types: new Map([
                ['type_3', { keys: 25, memory: getGenericTotal(51, 75) }],
              ]),
            },
          ],
          [
            Buffer.from('nsp_4').toString('hex'),
            {
              keys: 25,
              memory: getGenericTotal(76, 100),
              types: new Map([
                ['type_4', { keys: 25, memory: getGenericTotal(76, 100) }],
              ]),
            },
          ],
        ]),
      );
    });
    it('should get namespaces map (for keys without nsps)', async () => {
      const summary = await analyzer.getNamespacesMap(
        mockKeysWithNulls,
        mockPartialAnalysis.delimiter,
      );
      expect(summary).toEqual(
        new Map([
          [
            Buffer.from('nsp_1').toString('hex'),
            {
              keys: 2,
              memory: getGenericTotal(1, 2),
              types: new Map([
                ['type_1', { keys: 2, memory: getGenericTotal(1, 2) }],
              ]),
            },
          ],
        ]),
      );
    });
  });

  describe('analyze', () => {
    it('should return analysis', async () => {
      const summary = await analyzer.analyze(mockPartialAnalysis, mockKeys);
      expect(summary).toEqual({
        ...mockPartialAnalysis,
        topKeysMemory: [...mockKeys].reverse().slice(0, 15),
        topKeysLength: mockKeys.slice(0, 15),
        topMemoryNsp: [
          {
            nsp: Buffer.from('nsp_4'),
            keys: 25,
            memory: getGenericTotal(76, 100),
            types: [
              {
                type: 'type_4',
                keys: 25,
                memory: getGenericTotal(76, 100),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_3'),
            keys: 25,
            memory: getGenericTotal(51, 75),
            types: [
              {
                type: 'type_3',
                keys: 25,
                memory: getGenericTotal(51, 75),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_2'),
            keys: 25,
            memory: getGenericTotal(26, 50),
            types: [
              {
                type: 'type_2',
                keys: 25,
                memory: getGenericTotal(26, 50),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_1'),
            keys: 25,
            memory: getGenericTotal(1, 25),
            types: [
              {
                type: 'type_1',
                keys: 25,
                memory: getGenericTotal(1, 25),
              },
            ],
          },
        ],
        topKeysNsp: [
          {
            nsp: Buffer.from('nsp_4'),
            keys: 25,
            memory: getGenericTotal(76, 100),
            types: [
              {
                type: 'type_4',
                keys: 25,
                memory: getGenericTotal(76, 100),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_3'),
            keys: 25,
            memory: getGenericTotal(51, 75),
            types: [
              {
                type: 'type_3',
                keys: 25,
                memory: getGenericTotal(51, 75),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_2'),
            keys: 25,
            memory: getGenericTotal(26, 50),
            types: [
              {
                type: 'type_2',
                keys: 25,
                memory: getGenericTotal(26, 50),
              },
            ],
          },
          {
            nsp: Buffer.from('nsp_1'),
            keys: 25,
            memory: getGenericTotal(1, 25),
            types: [
              {
                type: 'type_1',
                keys: 25,
                memory: getGenericTotal(1, 25),
              },
            ],
          },
        ],
        totalMemory: {
          total: genericTotal,
          types: [
            {
              type: 'type_4',
              total: getGenericTotal(76, 100),
            },
            {
              type: 'type_3',
              total: getGenericTotal(51, 75),
            },
            {
              type: 'type_2',
              total: getGenericTotal(26, 50),
            },
            {
              type: 'type_1',
              total: getGenericTotal(1, 25),
            },
          ],
        },
        totalKeys: {
          total: mockKeys.length,
          types: [
            {
              type: 'type_4',
              total: 25,
            },
            {
              type: 'type_3',
              total: 25,
            },
            {
              type: 'type_2',
              total: 25,
            },
            {
              type: 'type_1',
              total: 25,
            },
          ],
        },
        expirationGroups: [
          {
            label: 'No Expiry',
            threshold: 0,
            total: genericTotal,
          },
          {
            label: '<1 hr',
            threshold: 3600,
            total: 0,
          },
          {
            label: '1-4 Hrs',
            threshold: 14400,
            total: 0,
          },
          {
            label: '4-12 Hrs',
            threshold: 43200,
            total: 0,
          },
          {
            label: '12-24 Hrs',
            threshold: 86400,
            total: 0,
          },
          {
            label: '1-7 Days',
            threshold: 604800,
            total: 0,
          },
          {
            label: '>7 Days',
            threshold: 2592000,
            total: 0,
          },
          {
            label: '>1 Month',
            threshold: 9007199254740991,
            total: 0,
          },
        ],
      });
    });
  });
});
