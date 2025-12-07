import { toNumber } from 'lodash'
import { COMPRESSOR_MAGIC_SYMBOLS, KeyValueCompressor } from 'uiSrc/constants'
import { UintArray } from 'uiSrc/slices/interfaces'
import { decompressingBuffer, getCompressor } from 'uiSrc/utils/decompressors'
import { anyToBuffer } from 'uiSrc/utils/formatters'
import {
  GZIP_COMPRESSED_VALUE_1,
  GZIP_COMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_1,
  DECOMPRESSED_VALUE_2,
  DECOMPRESSED_VALUE_STR_1,
  DECOMPRESSED_VALUE_STR_2,
  ZSTD_COMPRESSED_VALUE_1,
  ZSTD_COMPRESSED_VALUE_2,
  LZ4_COMPRESSED_VALUE_1,
  LZ4_COMPRESSED_VALUE_2,
  SNAPPY_COMPRESSED_VALUE_2,
  SNAPPY_COMPRESSED_VALUE_1,
  BROTLI_COMPRESSED_VALUE_1,
  BROTLI_COMPRESSED_VALUE_2,
  PHPGZCOMPRESS_COMPRESSED_VALUE_1,
  PHPGZCOMPRESS_COMPRESSED_VALUE_2,
} from './constants'

const defaultValues = [
  {
    input: [49],
    compressor: null,
    output: [49],
    outputStr: '1',
    isCompressed: false,
  },
  {
    input: [49, 50],
    compressor: null,
    output: [49, 50],
    outputStr: '12',
    isCompressed: false,
  },
  {
    input: COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.GZIP]
      .split(',')
      .map((symbol) => toNumber(symbol)),
    compressor: null,
    output: [31, 139],
    outputStr: '\\x1f\\x8b',
    isCompressed: false,
  },
  {
    input: COMPRESSOR_MAGIC_SYMBOLS[KeyValueCompressor.ZSTD]
      .split(',')
      .map((symbol) => toNumber(symbol)),
    compressor: null,
    output: [40, 181, 47, 253],
    outputStr: '(\\xb5/\\xfd',
    isCompressed: false,
  },
  {
    input: GZIP_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.GZIP,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: true,
  },
  {
    input: GZIP_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.GZIP,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
    isCompressed: true,
  },
  {
    input: ZSTD_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.ZSTD,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: true,
  },
  {
    input: ZSTD_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.ZSTD,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
    isCompressed: true,
  },
  {
    input: LZ4_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.LZ4,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: true,
  },
  {
    input: LZ4_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.LZ4,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
    isCompressed: true,
  },
  {
    input: SNAPPY_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.SNAPPY,
    compressorInit: KeyValueCompressor.SNAPPY,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: true,
  },
  {
    input: SNAPPY_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.SNAPPY,
    compressorInit: KeyValueCompressor.SNAPPY,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
    isCompressed: true,
  },
  {
    input: GZIP_COMPRESSED_VALUE_1,
    compressor: null,
    output: GZIP_COMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    compressorInit: KeyValueCompressor.LZ4,
    compressorByValue: KeyValueCompressor.GZIP,
    isCompressed: false,
  },
  {
    input: ZSTD_COMPRESSED_VALUE_1,
    compressor: null,
    compressorInit: KeyValueCompressor.LZ4,
    compressorByValue: KeyValueCompressor.ZSTD,
    output: ZSTD_COMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: false,
  },
  // TODO: Skipped: Requires significant time to fix WASM issues for Jest. Story to fix tests #RI-6565
  // {
  //   input: BROTLI_COMPRESSED_VALUE_1,
  //   compressor: KeyValueCompressor.Brotli,
  //   compressorInit: KeyValueCompressor.Brotli,
  //   output: DECOMPRESSED_VALUE_1,
  //   outputStr: DECOMPRESSED_VALUE_STR_1,
  //   isCompressed: true,
  // },
  // {
  //   input: BROTLI_COMPRESSED_VALUE_2,
  //   compressor: KeyValueCompressor.Brotli,
  //   compressorInit: KeyValueCompressor.Brotli,
  //   output: DECOMPRESSED_VALUE_2,
  //   outputStr: DECOMPRESSED_VALUE_STR_2,
  //   isCompressed: true,
  // },
  {
    input: PHPGZCOMPRESS_COMPRESSED_VALUE_1,
    compressor: KeyValueCompressor.PHPGZCompress,
    compressorInit: KeyValueCompressor.PHPGZCompress,
    output: DECOMPRESSED_VALUE_1,
    outputStr: DECOMPRESSED_VALUE_STR_1,
    isCompressed: true,
  },
  {
    input: PHPGZCOMPRESS_COMPRESSED_VALUE_2,
    compressor: KeyValueCompressor.PHPGZCompress,
    compressorInit: KeyValueCompressor.PHPGZCompress,
    output: DECOMPRESSED_VALUE_2,
    outputStr: DECOMPRESSED_VALUE_STR_2,
    isCompressed: true,
  },
].map((value) => ({
  ...value,
  input: anyToBuffer(value.input),
}))

describe('getCompressor', () => {
  test.each(defaultValues)(
    '%j',
    ({ input, compressor, compressorByValue = null }) => {
      let expected = compressorByValue || compressor

      // SNAPPY doesn't have magic symbols
      if (
        compressor === KeyValueCompressor.SNAPPY ||
        compressor === KeyValueCompressor.Brotli ||
        compressor === KeyValueCompressor.PHPGZCompress
      ) {
        expected = null
      }

      const result = getCompressor(input)
      expect(result).toEqual(expected)
    },
  )
})

describe('decompressingBuffer', () => {
  test.each(defaultValues)(
    '%j',
    ({ input, compressor, output, compressorInit = null, isCompressed }) => {
      const result = decompressingBuffer(input, compressorInit || compressor)
      let value: UintArray = output

      if (compressor) {
        value = new Uint8Array(output)
      }

      expect(result).toEqual({
        value: anyToBuffer(value),
        compressor,
        isCompressed,
      })
    },
  )
})
