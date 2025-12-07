import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Expose } from 'class-transformer';

export class IndexInfoRequestBodyDto {
  @ApiProperty({
    description: 'Index name',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;
}

export class IndexOptionsDto {
  @ApiProperty({
    description:
      'is a filter expression with the full RediSearch aggregation expression language.',
    type: String,
  })
  @Expose()
  filter?: string;

  @ApiProperty({
    description:
      'if set, indicates the default language for documents in the index. Default is English.',
    type: String,
  })
  @Expose()
  default_lang?: string;
}

export class IndexDefinitionDto {
  @ApiProperty({
    description: 'key_type, hash or JSON',
    type: String,
  })
  @Expose()
  key_type: string;

  @ApiProperty({
    description: 'Index prefixes given during create',
    type: String,
    isArray: true,
  })
  @Expose()
  prefixes: Array<string>;

  @ApiProperty({
    description: 'Index default_score',
    type: String,
  })
  @Expose()
  default_score: string;

  @ApiProperty({
    description:
      'Indicates whether all fields of a JSON document are automatically indexed by RediSearch',
    type: String,
  })
  @Expose()
  indexes_all?: string;
}

export class IndexAttibuteDto {
  @ApiProperty({
    description: 'Field identifier',
    type: String,
  })
  @Expose()
  identifier: string;

  @ApiProperty({
    description: 'Field attribute',
    type: String,
  })
  @Expose()
  attribute: string;

  @ApiProperty({
    description: 'Field type',
    type: String,
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Field weight',
    type: String,
  })
  @Expose()
  WEIGHT?: string;

  @ApiProperty({
    description: 'Field can be sorted',
    type: Boolean,
  })
  @Expose()
  SORTABLE?: boolean;

  @ApiProperty({
    description:
      'Attributes can have the NOINDEX option, which means they will not be indexed. ',
    type: Boolean,
  })
  @Expose()
  NOINDEX?: boolean;

  @ApiProperty({
    description: 'Attribute is case sensitive',
    type: Boolean,
  })
  @Expose()
  CASESENSITIVE?: boolean;

  @ApiProperty({
    description: `By default, for hashes (not with JSON) SORTABLE applies a normalization to the indexed value
      (characters set to lowercase, removal of diacritics).`,
    type: Boolean,
  })
  @Expose()
  UNF?: boolean;

  @ApiProperty({
    description: `Text attributes can have the NOSTEM argument that disables stemming when indexing its values.
      This may be ideal for things like proper names.`,
    type: Boolean,
  })
  @Expose()
  NOSTEM?: boolean;

  @ApiProperty({
    description: `Indicates how the text contained in the attribute is to be split into individual tags.
      The default is ,. The value must be a single character.`,
    type: String,
  })
  @Expose()
  SEPARATOR?: string;
}

export class FieldStatisticsDto {
  @ApiProperty({
    description: 'Field identifier',
    type: String,
  })
  @Expose()
  identifier: string;

  @ApiProperty({
    description: 'Field attribute',
    type: String,
  })
  @Expose()
  attribute: string;

  @ApiProperty({
    description: 'Field errors',
    type: Object,
  })
  @Expose()
  ['Index Errors']: object;
}

// The list of return fields from redis: https://redis.io/docs/latest/commands/ft.info/

export class IndexInfoDto {
  // General
  @ApiProperty({
    description: 'The index name that was defined when index was created',
    type: String,
  })
  @Expose()
  @IsDefined()
  index_name: string;

  @ApiProperty({
    description:
      'The index options selected during FT.CREATE such as FILTER {filter}, LANGUAGE {default_lang}, etc.',
    type: IndexOptionsDto,
  })
  @Expose()
  index_options: IndexOptionsDto;

  @ApiProperty({
    description:
      'Includes key_type, hash or JSON; prefixes, if any; and default_score.',
    type: IndexDefinitionDto,
  })
  @Expose()
  index_definition: IndexDefinitionDto;

  @ApiProperty({
    description: 'The index schema field names, types, and attributes.',
    type: IndexAttibuteDto,
    isArray: true,
  })
  @Expose()
  attributes: IndexAttibuteDto[];

  @ApiProperty({
    description: 'The number of documents.',
    type: String,
  })
  @Expose()
  num_docs: string;

  @ApiProperty({
    description: 'The maximum document ID.',
    type: String,
  })
  @Expose()
  max_doc_id?: string;

  @ApiProperty({
    description: 'The number of distinct terms.',
    type: String,
  })
  @Expose()
  num_terms?: string;

  @ApiProperty({
    description: 'The total number of records.',
    type: String,
  })
  @Expose()
  num_records?: string;

  // Various size statistics
  @ApiProperty({
    description: `The memory used by the inverted index, which is the core data structure
      used for searching in RediSearch. The size is given in megabytes.`,
    type: String,
  })
  @Expose()
  inverted_sz_mb?: string;

  @ApiProperty({
    description: `The memory used by the vector index,
      which stores any vectors associated with each document.`,
    type: String,
  })
  @Expose()
  vector_index_sz_mb?: string;

  @ApiProperty({
    description: 'The total number of blocks in the inverted index.',
    type: String,
  })
  @Expose()
  total_inverted_index_blocks?: string;

  @ApiProperty({
    description: `The memory used by the offset vectors,
      which store positional information for terms in documents.`,
    type: String,
  })
  @Expose()
  offset_vectors_sz_mb?: string;

  @ApiProperty({
    description: `The memory used by the document table,
      which contains metadata about each document in the index.`,
    type: String,
  })
  @Expose()
  doc_table_size_mb?: string;

  @ApiProperty({
    description: `The memory used by sortable values,
      which are values associated with documents and used for sorting purposes.`,
    type: String,
  })
  @Expose()
  sortable_values_size_mb?: string;

  @ApiProperty({
    description: 'Tag overhead memory usage in mb',
    type: String,
  })
  @Expose()
  tag_overhead_sz_mb?: string;

  @ApiProperty({
    description: 'Text overhead memory usage in mb',
    type: String,
  })
  @Expose()
  text_overhead_sz_mb?: string;

  @ApiProperty({
    description: 'Total index memory size in mb',
    type: String,
  })
  @Expose()
  total_index_memory_sz_mb?: string;

  @ApiProperty({
    description: `The memory used by the key table,
      which stores the mapping between document IDs and Redis keys`,
    type: String,
  })
  @Expose()
  key_table_size_mb?: string;

  @ApiProperty({
    description: 'The memory used by GEO-related fields.',
    type: String,
  })
  @Expose()
  geoshapes_sz_mb?: string;

  @ApiProperty({
    description:
      'The average number of records (including deletions) per document.',
    type: String,
  })
  @Expose()
  records_per_doc_avg?: string;

  @ApiProperty({
    description: 'The average size of each record in bytes.',
    type: String,
  })
  @Expose()
  bytes_per_record_avg?: string;

  @ApiProperty({
    description:
      'The average number of offsets (position information) per term.',
    type: String,
  })
  @Expose()
  offsets_per_term_avg?: string;

  @ApiProperty({
    description: 'The average number of bits used for offsets per record.',
    type: String,
  })
  @Expose()
  offset_bits_per_record_avg?: string;

  // Indexing-related statistics
  @ApiProperty({
    description: 'The number of failures encountered during indexing.',
    type: String,
  })
  @Expose()
  hash_indexing_failures?: string;

  @ApiProperty({
    description: 'The total time taken for indexing in seconds.',
    type: String,
  })
  @Expose()
  total_indexing_time?: string;

  @ApiProperty({
    description: 'Indicates whether the index is currently being generated.',
    type: String,
  })
  @Expose()
  indexing?: string;

  @ApiProperty({
    description:
      'The percentage of the index that has been successfully generated.',
    type: String,
  })
  @Expose()
  percent_indexed?: string;

  @ApiProperty({
    description: 'The number of times the index has been used.',
    type: Number,
  })
  @Expose()
  number_of_uses?: number;

  @ApiProperty({
    description:
      'The index deletion flag. A value of 1 indicates index deletion is in progress.',
    type: Number,
  })
  @Expose()
  cleaning?: number;

  // Other
  @ApiProperty({
    description: 'Garbage collection statistics',
    type: Object,
  })
  @Expose()
  gc_stats?: object;

  @ApiProperty({
    description: 'Cursor statistics',
    type: Object,
  })
  @Expose()
  cursor_stats?: object;

  @ApiProperty({
    description:
      'Dialect statistics: the number of times the index was searched using each DIALECT, 1 - 4.',
    type: Object,
  })
  @Expose()
  dialect_stats?: object;

  @ApiProperty({
    description: `Index error statistics, including indexing failures, last indexing error,
      and last indexing error key.`,
    type: Object,
  })
  @Expose()
  ['Index Errors']?: object;

  @ApiProperty({
    description:
      'Dialect statistics: the number of times the index was searched using each DIALECT, 1 - 4.',
    type: FieldStatisticsDto,
    isArray: true,
  })
  @Expose()
  ['field statistics']?: Array<FieldStatisticsDto>;
}
