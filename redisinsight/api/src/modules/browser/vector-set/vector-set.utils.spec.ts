import { BadRequestException, Logger } from '@nestjs/common';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  addVectorSetElementDtoFactory,
  FP32_VECTOR_FIXTURE_1_2_3,
  fp32AddVectorSetElementDtoFactory,
  similaritySearchDtoFactory,
  SEARCH_VSIM_MATCH_ATTRIBUTES_1,
  SEARCH_VSIM_MATCH_NAME_1,
  SEARCH_VSIM_MATCH_NAME_2,
  SEARCH_VSIM_REPLY_TWO_MATCHES,
} from 'src/modules/browser/vector-set/__tests__/vector-set.factory';
import {
  buildVaddCommand,
  buildVsimCommand,
  formatVsimCommandPreview,
  parseVsimReply,
} from 'src/modules/browser/vector-set/vector-set.utils';

describe('vector-set.utils', () => {
  describe('buildVaddCommand', () => {
    const keyName = Buffer.from('vset:key');

    it('should build VADD with VALUES, stringified entries, and trailing element name', () => {
      const element = addVectorSetElementDtoFactory.build({
        name: Buffer.from('e1'),
        vectorValues: [0.1, 0.2, 0.3],
      });

      const command = buildVaddCommand(keyName, element);

      expect(command).toEqual([
        BrowserToolVectorSetCommands.VAdd,
        keyName,
        'VALUES',
        3,
        '0.1',
        '0.2',
        '0.3',
        element.name,
      ]);
    });

    it('should build VADD with FP32 Buffer payload when vectorFp32 is supplied', () => {
      const element = fp32AddVectorSetElementDtoFactory.build({
        name: Buffer.from('e1'),
      });

      const command = buildVaddCommand(keyName, element);

      expect(command).toEqual([
        BrowserToolVectorSetCommands.VAdd,
        keyName,
        'FP32',
        FP32_VECTOR_FIXTURE_1_2_3.buffer,
        element.name,
      ]);
    });

    it('should append SETATTR <attributes> when attributes are supplied', () => {
      const element = addVectorSetElementDtoFactory.build({
        attributes: '{"color":"red"}',
      });

      const command = buildVaddCommand(keyName, element) as unknown[];

      expect(command.slice(-2)).toEqual(['SETATTR', '{"color":"red"}']);
    });

    it('should throw BadRequestException when both vectorFp32 and vectorValues are supplied', () => {
      const element = addVectorSetElementDtoFactory.build({
        vectorValues: [1, 2, 3],
        vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
      });

      expect(() => buildVaddCommand(keyName, element)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when neither vectorFp32 nor vectorValues are supplied', () => {
      const element = addVectorSetElementDtoFactory.build({
        vectorValues: undefined,
        vectorFp32: undefined,
      });

      expect(() => buildVaddCommand(keyName, element)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when vectorValues is an empty array', () => {
      const element = addVectorSetElementDtoFactory.build({
        vectorValues: [],
        vectorFp32: undefined,
      });

      expect(() => buildVaddCommand(keyName, element)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('buildVsimCommand', () => {
    it('should emit ELE clause with WITHSCORES/WITHATTRIBS and COUNT for elementName mode', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: 5,
      });

      expect(buildVsimCommand(dto)).toEqual([
        BrowserToolVectorSetCommands.VSim,
        dto.keyName,
        'ELE',
        dto.elementName,
        'COUNT',
        5,
        'WITHSCORES',
        'WITHATTRIBS',
      ]);
    });

    it('should stringify each numeric vector entry to preserve float precision on the wire', () => {
      const dto = similaritySearchDtoFactory.build(
        { vectorValues: [0.1, 0.2, 0.3], count: 10 },
        { transient: { variant: 'values' } },
      );

      const command = buildVsimCommand(dto) as unknown[];

      expect(command).toEqual([
        BrowserToolVectorSetCommands.VSim,
        dto.keyName,
        'VALUES',
        3,
        '0.1',
        '0.2',
        '0.3',
        'COUNT',
        10,
        'WITHSCORES',
        'WITHATTRIBS',
      ]);
    });

    it('should pass FP32 as a raw Buffer (decoded from the base64 DTO field)', () => {
      const dto = similaritySearchDtoFactory.build(
        { count: 3 },
        { transient: { variant: 'fp32' } },
      );

      const command = buildVsimCommand(dto) as unknown[];

      expect(command).toEqual([
        BrowserToolVectorSetCommands.VSim,
        dto.keyName,
        'FP32',
        FP32_VECTOR_FIXTURE_1_2_3.buffer,
        'COUNT',
        3,
        'WITHSCORES',
        'WITHATTRIBS',
      ]);
    });

    it('should append FILTER <expr> after the WITHSCORES/WITHATTRIBS tail', () => {
      const dto = similaritySearchDtoFactory.build({
        count: 4,
        filter: '.color == "red"',
      });

      const command = buildVsimCommand(dto) as unknown[];

      expect(command.slice(-2)).toEqual(['FILTER', '.color == "red"']);
      expect(command.indexOf('FILTER')).toBeGreaterThan(
        command.indexOf('WITHATTRIBS'),
      );
    });

    it('should omit the COUNT clause when count is undefined', () => {
      const dto = similaritySearchDtoFactory.build({
        count: undefined,
      });

      const command = buildVsimCommand(dto) as unknown[];

      expect(command).not.toContain('COUNT');
      expect(command).toContain('WITHSCORES');
      expect(command).toContain('WITHATTRIBS');
    });

    it('should throw BadRequestException when no query payload is supplied', () => {
      const dto = similaritySearchDtoFactory.build({
        elementName: undefined,
        vectorValues: undefined,
        vectorFp32: undefined,
      });

      expect(() => buildVsimCommand(dto)).toThrow(BadRequestException);
      expect(() => buildVsimCommand(dto)).toThrow(/requires one of/);
    });

    it('should throw BadRequestException when more than one query payload is supplied', () => {
      const dto = similaritySearchDtoFactory.build({
        elementName: Buffer.from('e'),
        vectorValues: [1, 2, 3],
      });

      expect(() => buildVsimCommand(dto)).toThrow(BadRequestException);
      expect(() => buildVsimCommand(dto)).toThrow(/exactly one/);
    });

    it('should omit WITHATTRIBS when `withAttribs: false` is supplied (Redis 8.0.0–8.0.2 fallback)', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: 5,
      });

      const command = buildVsimCommand(dto, {
        withAttribs: false,
      }) as unknown[];

      expect(command).toEqual([
        BrowserToolVectorSetCommands.VSim,
        dto.keyName,
        'ELE',
        dto.elementName,
        'COUNT',
        5,
        'WITHSCORES',
      ]);
      expect(command).not.toContain('WITHATTRIBS');
    });

    it('should still place FILTER after WITHSCORES when `withAttribs: false`', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: 4,
        filter: '.color == "red"',
      });

      const command = buildVsimCommand(dto, {
        withAttribs: false,
      }) as unknown[];

      expect(command).not.toContain('WITHATTRIBS');
      expect(command.indexOf('FILTER')).toBeGreaterThan(
        command.indexOf('WITHSCORES'),
      );
      expect(command.slice(-2)).toEqual(['FILTER', '.color == "red"']);
    });
  });

  describe('formatVsimCommandPreview', () => {
    it('should render an ELE preview with the key + element decoded from Buffers', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: 5,
      });

      expect(formatVsimCommandPreview(dto)).toBe(
        'VSIM vset:key ELE seed COUNT 5 WITHSCORES WITHATTRIBS',
      );
    });

    it('should quote elements that contain whitespace or quotes for CLI safety', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('with space'),
        count: undefined,
      });

      expect(formatVsimCommandPreview(dto)).toBe(
        'VSIM vset:key ELE "with space" WITHSCORES WITHATTRIBS',
      );
    });

    it('should quote keyName that contains whitespace for CLI safety', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('my vector set'),
        elementName: Buffer.from('seed'),
        count: 5,
      });

      expect(formatVsimCommandPreview(dto)).toBe(
        'VSIM "my vector set" ELE seed COUNT 5 WITHSCORES WITHATTRIBS',
      );
    });

    it('should escape embedded double-quotes in keyName with backslashes', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('a"b'),
        elementName: Buffer.from('seed'),
        count: undefined,
      });

      expect(formatVsimCommandPreview(dto)).toContain('VSIM "a\\"b" ELE');
    });

    it('should escape embedded double-quotes in elements with backslashes', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('a"b'),
        count: undefined,
      });

      expect(formatVsimCommandPreview(dto)).toContain('"a\\"b"');
    });

    it('should render numeric VALUES inline (stringified) without quoting', () => {
      const dto = similaritySearchDtoFactory.build(
        {
          keyName: Buffer.from('vset:key'),
          vectorValues: [0.1, 0.2, 0.3],
          count: undefined,
        },
        { transient: { variant: 'values' } },
      );

      expect(formatVsimCommandPreview(dto)).toBe(
        'VSIM vset:key VALUES 3 0.1 0.2 0.3 WITHSCORES WITHATTRIBS',
      );
    });

    it('should render FP32 bytes as a quoted `\\xHH...` escape string', () => {
      const dto = similaritySearchDtoFactory.build(
        {
          keyName: Buffer.from('vset:key'),
          count: undefined,
        },
        { transient: { variant: 'fp32' } },
      );

      expect(formatVsimCommandPreview(dto)).toBe(
        'VSIM vset:key FP32 "\\x00\\x00\\x80\\x3f\\x00\\x00\\x00\\x40\\x00\\x00\\x40\\x40" WITHSCORES WITHATTRIBS',
      );
    });

    it('should append FILTER <expr> as the last clause and quote when needed', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: undefined,
        filter: '.color == "red"',
      });

      const preview = formatVsimCommandPreview(dto);

      expect(preview.endsWith('FILTER ".color == \\"red\\""')).toBe(true);
    });

    it('should throw BadRequestException when no query payload is supplied', () => {
      const dto = similaritySearchDtoFactory.build({
        elementName: undefined,
        vectorValues: undefined,
        vectorFp32: undefined,
      });

      expect(() => formatVsimCommandPreview(dto)).toThrow(BadRequestException);
      expect(() => formatVsimCommandPreview(dto)).toThrow(/requires one of/);
    });

    it('should throw BadRequestException even when keyName and filter are present but no query payload', () => {
      const dto = similaritySearchDtoFactory.build({
        elementName: undefined,
        vectorValues: undefined,
        vectorFp32: undefined,
        filter: '.x > 1',
      });

      expect(() => formatVsimCommandPreview(dto)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when more than one query payload is supplied', () => {
      const dto = similaritySearchDtoFactory.build({
        elementName: Buffer.from('e'),
        vectorValues: [1, 2, 3],
      });

      expect(() => formatVsimCommandPreview(dto)).toThrow(BadRequestException);
      expect(() => formatVsimCommandPreview(dto)).toThrow(/exactly one/);
    });

    it('should omit WITHATTRIBS in preview when `withAttribs: false` is supplied', () => {
      const dto = similaritySearchDtoFactory.build({
        keyName: Buffer.from('vset:key'),
        elementName: Buffer.from('seed'),
        count: 5,
      });

      expect(formatVsimCommandPreview(dto, { withAttribs: false })).toBe(
        'VSIM vset:key ELE seed COUNT 5 WITHSCORES',
      );
    });
  });

  describe('parseVsimReply', () => {
    it('should return [] for null, undefined, or empty replies', () => {
      expect(parseVsimReply(null)).toEqual([]);
      expect(parseVsimReply(undefined)).toEqual([]);
      expect(parseVsimReply([])).toEqual([]);
    });

    it('should parse the canonical two-match reply (stride 3) into name/score/attributes tuples', () => {
      const matches = parseVsimReply(SEARCH_VSIM_REPLY_TWO_MATCHES);

      expect(matches).toEqual([
        {
          name: SEARCH_VSIM_MATCH_NAME_1,
          score: 0.95,
          attributes: SEARCH_VSIM_MATCH_ATTRIBUTES_1,
        },
        { name: SEARCH_VSIM_MATCH_NAME_2, score: 0.81 },
      ]);
    });

    it('should parse a Buffer score into a float number', () => {
      const matches = parseVsimReply([
        Buffer.from('m'),
        Buffer.from('0.42'),
        null,
      ]);

      expect(matches[0].score).toBeCloseTo(0.42, 6);
      expect(typeof matches[0].score).toBe('number');
    });

    it('should pass through a numeric (RESP3 double) score unchanged', () => {
      const matches = parseVsimReply([Buffer.from('m'), 0.42 as never, null]);

      expect(matches[0].score).toBe(0.42);
    });

    it('should decode a Buffer attributes payload via String()', () => {
      const buf = Buffer.from('{"k":"v"}');
      const matches = parseVsimReply([Buffer.from('m'), '0.5', buf]);

      expect(matches[0].attributes).toBe('{"k":"v"}');
    });

    it('should drop a trailing partial tuple when reply length is not a multiple of 3', () => {
      const reply: Array<string | Buffer | null> = [
        Buffer.from('m1'),
        '0.9',
        null,
        Buffer.from('m2'),
      ];

      const matches = parseVsimReply(reply);

      expect(matches).toHaveLength(1);
      expect(matches[0].name).toEqual(Buffer.from('m1'));
    });

    it('should warn via the supplied logger when a partial tuple is dropped', () => {
      const logger = { warn: jest.fn() } as unknown as Logger;
      const reply: Array<string | Buffer | null> = [
        Buffer.from('m1'),
        '0.9',
        null,
        Buffer.from('m2'),
      ];

      parseVsimReply(reply, logger);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not a multiple of 3'),
      );
    });

    it('should not throw when no logger is supplied and reply length is misaligned', () => {
      const reply: Array<string | Buffer | null> = [
        Buffer.from('m1'),
        '0.9',
        null,
        Buffer.from('m2'),
      ];

      expect(() => parseVsimReply(reply)).not.toThrow();
    });

    it('should parse a (name, score) reply with stride 2 when `withAttribs: false`', () => {
      const reply: Array<string | Buffer | null> = [
        Buffer.from('m1'),
        '0.95',
        Buffer.from('m2'),
        '0.81',
      ];

      const matches = parseVsimReply(reply, undefined, { withAttribs: false });

      expect(matches).toEqual([
        { name: Buffer.from('m1'), score: 0.95 },
        { name: Buffer.from('m2'), score: 0.81 },
      ]);
      expect(matches[0].attributes).toBeUndefined();
      expect(matches[1].attributes).toBeUndefined();
    });

    it('should drop a trailing partial tuple at stride 2 when `withAttribs: false`', () => {
      const reply: Array<string | Buffer | null> = [
        Buffer.from('m1'),
        '0.9',
        Buffer.from('m2'),
      ];
      const logger = { warn: jest.fn() } as unknown as Logger;

      const matches = parseVsimReply(reply, logger, { withAttribs: false });

      expect(matches).toHaveLength(1);
      expect(matches[0].name).toEqual(Buffer.from('m1'));
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('not a multiple of 2'),
      );
    });
  });
});
