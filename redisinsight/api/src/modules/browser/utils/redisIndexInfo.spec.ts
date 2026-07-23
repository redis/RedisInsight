import {
  convertArrayReplyToObject,
  convertIndexInfoAttributeReply,
  convertIndexInfoReply,
} from './redisIndexInfo';

describe('redisIndexInfo', () => {
  describe('convertIndexInfoAttributeReply', () => {
    it('parses key/value pairs and trailing boolean flags', () => {
      expect(
        convertIndexInfoAttributeReply([
          'identifier',
          '$.chunkText',
          'attribute',
          'chunkText_trie',
          'type',
          'TEXT',
          'WEIGHT',
          '1',
          'WITHSUFFIXTRIE',
        ]),
      ).toEqual({
        identifier: '$.chunkText',
        attribute: 'chunkText_trie',
        type: 'TEXT',
        WEIGHT: '1',
        WITHSUFFIXTRIE: true,
      });
    });

    it('does not treat a field alias named like a flag as enabling that flag', () => {
      expect(
        convertIndexInfoAttributeReply([
          'identifier',
          '$.chunkText',
          'attribute',
          'WITHSUFFIXTRIE',
          'type',
          'TEXT',
          'WEIGHT',
          '1',
        ]),
      ).toEqual({
        identifier: '$.chunkText',
        attribute: 'WITHSUFFIXTRIE',
        type: 'TEXT',
        WEIGHT: '1',
      });
    });

    it('enables the flag when both alias and option use the same token', () => {
      expect(
        convertIndexInfoAttributeReply([
          'identifier',
          '$.chunkText',
          'attribute',
          'WITHSUFFIXTRIE',
          'type',
          'TEXT',
          'WITHSUFFIXTRIE',
        ]),
      ).toEqual({
        identifier: '$.chunkText',
        attribute: 'WITHSUFFIXTRIE',
        type: 'TEXT',
        WITHSUFFIXTRIE: true,
      });
    });

    it('parses interleaved boolean flags among valued keys', () => {
      expect(
        convertIndexInfoAttributeReply([
          'identifier',
          'title',
          'attribute',
          'title',
          'type',
          'TEXT',
          'SORTABLE',
          'NOSTEM',
          'WEIGHT',
          '2',
        ]),
      ).toEqual({
        identifier: 'title',
        attribute: 'title',
        type: 'TEXT',
        SORTABLE: true,
        NOSTEM: true,
        WEIGHT: '2',
      });
    });

    it('returns empty object for non-arrays', () => {
      expect(convertIndexInfoAttributeReply(null as any)).toEqual({});
      expect(convertIndexInfoAttributeReply(undefined as any)).toEqual({});
      expect(convertIndexInfoAttributeReply({} as any)).toEqual({});
    });
  });

  describe('convertIndexInfoReply', () => {
    it('maps attributes with boolean flags', () => {
      const result = convertIndexInfoReply([
        'index_name',
        'idx',
        'attributes',
        [
          [
            'identifier',
            '$.a',
            'attribute',
            'a',
            'type',
            'TEXT',
            'WITHSUFFIXTRIE',
          ],
          ['identifier', '$.b', 'attribute', 'WITHSUFFIXTRIE', 'type', 'TEXT'],
        ],
      ] as any) as any;

      expect(result.attributes[0].WITHSUFFIXTRIE).toBe(true);
      expect(result.attributes[1].attribute).toBe('WITHSUFFIXTRIE');
      expect(result.attributes[1].WITHSUFFIXTRIE).toBeUndefined();
    });
  });

  describe('convertArrayReplyToObject', () => {
    it('chunks key/value pairs', () => {
      expect(convertArrayReplyToObject(['key', 'value'])).toEqual({
        key: 'value',
      });
    });
  });
});
