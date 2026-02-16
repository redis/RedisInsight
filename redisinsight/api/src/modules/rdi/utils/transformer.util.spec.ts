import {
  RdiStatisticsBlocksSection,
  RdiStatisticsInfoSection,
  RdiStatisticsTableSection,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import {
  generateHeaderFromFieldName,
  generateColumns,
  hasData,
} from './transformer.util';

describe('transformer.util', () => {
  describe('generateHeaderFromFieldName', () => {
    it('should handle simple lowercase word', () => {
      expect(generateHeaderFromFieldName('user')).toBe('User');
    });

    it('should handle simple uppercase word', () => {
      expect(generateHeaderFromFieldName('ID')).toBe('Id');
    });

    it('should handle snake_case', () => {
      expect(generateHeaderFromFieldName('age_sec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('total_batches')).toBe(
        'Total batches',
      );
      expect(generateHeaderFromFieldName('batch_size_avg')).toBe(
        'Batch size avg',
      );
    });

    it('should handle kebab-case', () => {
      expect(generateHeaderFromFieldName('age-sec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('total-batches')).toBe(
        'Total batches',
      );
      expect(generateHeaderFromFieldName('batch-size-avg')).toBe(
        'Batch size avg',
      );
    });

    it('should handle camelCase', () => {
      expect(generateHeaderFromFieldName('ageSec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('totalBatches')).toBe('Total batches');
      expect(generateHeaderFromFieldName('batchSizeAvg')).toBe(
        'Batch size avg',
      );
    });

    it('should handle PascalCase', () => {
      expect(generateHeaderFromFieldName('AgeSec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('TotalBatches')).toBe('Total batches');
      expect(generateHeaderFromFieldName('BatchSizeAvg')).toBe(
        'Batch size avg',
      );
    });

    it('should handle space-separated words', () => {
      expect(generateHeaderFromFieldName('age sec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('total batches')).toBe(
        'Total batches',
      );
    });

    it('should handle mixed separators', () => {
      expect(generateHeaderFromFieldName('age_sec-avg')).toBe('Age sec avg');
      expect(generateHeaderFromFieldName('total_batches-per-sec')).toBe(
        'Total batches per sec',
      );
    });

    it('should handle multiple spaces', () => {
      expect(generateHeaderFromFieldName('age  sec')).toBe('Age sec');
      expect(generateHeaderFromFieldName('total   batches')).toBe(
        'Total batches',
      );
    });

    it('should handle leading/trailing spaces', () => {
      expect(generateHeaderFromFieldName(' age_sec ')).toBe('Age sec');
      expect(generateHeaderFromFieldName('  user  ')).toBe('User');
    });

    it('should handle single character', () => {
      expect(generateHeaderFromFieldName('a')).toBe('A');
      expect(generateHeaderFromFieldName('x')).toBe('X');
    });

    it('should handle empty string', () => {
      expect(generateHeaderFromFieldName('')).toBe('');
    });

    it('should handle numbers in field names', () => {
      expect(generateHeaderFromFieldName('field1')).toBe('Field1');
      expect(generateHeaderFromFieldName('age_sec_2')).toBe('Age sec 2');
      expect(generateHeaderFromFieldName('test_123_field')).toBe(
        'Test 123 field',
      );
    });

    it('should handle real-world examples from RDI statistics', () => {
      expect(generateHeaderFromFieldName('id')).toBe('Id');
      expect(generateHeaderFromFieldName('addr')).toBe('Addr');
      expect(generateHeaderFromFieldName('idle_sec')).toBe('Idle sec');
      expect(generateHeaderFromFieldName('last_arrival')).toBe('Last arrival');
      expect(generateHeaderFromFieldName('total_batches')).toBe(
        'Total batches',
      );
      expect(generateHeaderFromFieldName('batch_size_avg')).toBe(
        'Batch size avg',
      );
      expect(generateHeaderFromFieldName('read_time_avg')).toBe(
        'Read time avg',
      );
      expect(generateHeaderFromFieldName('process_time_avg')).toBe(
        'Process time avg',
      );
      expect(generateHeaderFromFieldName('ack_time_avg')).toBe('Ack time avg');
      expect(generateHeaderFromFieldName('total_time_avg')).toBe(
        'Total time avg',
      );
      expect(generateHeaderFromFieldName('rec_per_sec_avg')).toBe(
        'Rec per sec avg',
      );
    });
  });

  describe('generateColumns', () => {
    it('should return empty array for empty data', () => {
      expect(generateColumns([])).toEqual([]);
    });

    it('should return empty array for null/undefined data', () => {
      expect(generateColumns(null as any)).toEqual([]);
      expect(generateColumns(undefined as any)).toEqual([]);
    });

    it('should auto-generate columns from data keys', () => {
      const data = [{ id: '1', user_name: 'John', age_sec: 30 }];
      const result = generateColumns(data);

      expect(result).toEqual([
        { id: 'id', header: 'Id' },
        { id: 'user_name', header: 'User name' },
        { id: 'age_sec', header: 'Age sec' },
      ]);
    });

    it('should use custom header when provided as string', () => {
      const data = [{ id: '1', user_name: 'John' }];
      const customColumns = { user_name: 'Username' };
      const result = generateColumns(data, customColumns);

      expect(result).toEqual([
        { id: 'id', header: 'Id' },
        { id: 'user_name', header: 'Username' },
      ]);
    });

    it('should use custom header when provided as object', () => {
      const data = [{ id: '1', host_port: 'localhost:6379' }];
      const customColumns = { host_port: { header: 'Host:port' } };
      const result = generateColumns(data, customColumns);

      expect(result).toEqual([
        { id: 'id', header: 'Id' },
        { id: 'host_port', header: 'Host:port' },
      ]);
    });

    it('should include type when provided', () => {
      const data = [{ status: 'connected', name: 'test' }];
      const customColumns = {
        status: { header: 'Status', type: 'status' },
      };
      const result = generateColumns(data, customColumns);

      expect(result).toEqual([
        { id: 'status', header: 'Status', type: 'status' },
        { id: 'name', header: 'Name' },
      ]);
    });

    it('should auto-generate header when only type is provided', () => {
      const data = [{ connection_status: 'active' }];
      const customColumns = { connection_status: { type: 'status' } };
      const result = generateColumns(data, customColumns);

      expect(result).toEqual([
        {
          id: 'connection_status',
          header: 'Connection status',
          type: 'status',
        },
      ]);
    });

    it('should handle mixed custom column configurations', () => {
      const data = [
        { id: '1', status: 'ok', user_name: 'John', host_port: 'localhost' },
      ];
      const customColumns = {
        status: { type: 'status' },
        user_name: 'Username',
        host_port: { header: 'Host:port' },
      };
      const result = generateColumns(data, customColumns);

      expect(result).toEqual([
        { id: 'id', header: 'Id' },
        { id: 'status', header: 'Status', type: 'status' },
        { id: 'user_name', header: 'Username' },
        { id: 'host_port', header: 'Host:port' },
      ]);
    });

    it('should preserve field order from data', () => {
      const data = [{ z_field: 1, a_field: 2, m_field: 3 }];
      const result = generateColumns(data);

      expect(result.map((c) => c.id)).toEqual([
        'z_field',
        'a_field',
        'm_field',
      ]);
    });
  });

  describe('hasData', () => {
    describe('table sections', () => {
      it('should return true when table section has columns and data', () => {
        const section: RdiStatisticsTableSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Table,
          columns: [{ id: 'name', header: 'Name' }],
          data: [{ name: 'test' }],
        };

        expect(hasData(section)).toBe(true);
      });

      it('should return false when table section has empty columns', () => {
        const section: RdiStatisticsTableSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Table,
          columns: [],
          data: [{ name: 'test' }],
        };

        expect(hasData(section)).toBe(false);
      });

      it('should return false when table section has empty data', () => {
        const section: RdiStatisticsTableSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Table,
          columns: [{ id: 'name', header: 'Name' }],
          data: [],
        };

        expect(hasData(section)).toBe(false);
      });

      it('should return false when table section has both empty columns and data', () => {
        const section: RdiStatisticsTableSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Table,
          columns: [],
          data: [],
        };

        expect(hasData(section)).toBe(false);
      });
    });

    describe('blocks sections', () => {
      it('should return true when blocks section has data', () => {
        const section: RdiStatisticsBlocksSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Blocks,
          data: [{ label: 'Count', value: 10, units: 'Total' }],
        };

        expect(hasData(section)).toBe(true);
      });

      it('should return false when blocks section has empty data', () => {
        const section: RdiStatisticsBlocksSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Blocks,
          data: [],
        };

        expect(hasData(section)).toBe(false);
      });
    });

    describe('info sections', () => {
      it('should return true for info sections regardless of data', () => {
        const section: RdiStatisticsInfoSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Info,
          data: [],
        };

        expect(hasData(section)).toBe(true);
      });

      it('should return true for info sections with data', () => {
        const section: RdiStatisticsInfoSection = {
          name: 'Test',
          view: RdiStatisticsViewType.Info,
          data: [{ label: 'Version', value: '1.0.0' }],
        };

        expect(hasData(section)).toBe(true);
      });
    });
  });
});
