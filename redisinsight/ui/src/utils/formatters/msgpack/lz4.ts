/**
 * LZ4 decompression utilities for MessagePack-CSharp format
 *
 * @see https://github.com/MessagePack-CSharp/MessagePack-CSharp#lz4-compression
 */

// @ts-ignore - lz4js doesn't have type definitions
import { decompressBlock as decompressLz4Block, makeBuffer } from 'lz4js'

// Marker symbol to identify LZ4 size markers in decoded output
export const LZ4_SIZE_MARKER = Symbol('lz4Size')

export interface Lz4SizeMarker {
  [LZ4_SIZE_MARKER]: true
  size: number
  compressedData?: Uint8Array // For inline format where data is in the ext payload
}

/**
 * Checks if a value is an LZ4 size marker
 */
export function isLz4SizeMarker(value: unknown): value is Lz4SizeMarker {
  return typeof value === 'object' && value !== null && LZ4_SIZE_MARKER in value
}

/**
 * Reads a msgpack integer from a buffer
 */
export function readMsgpackInt(buffer: Uint8Array): number | null {
  if (buffer.length === 0) return null

  const firstByte = buffer[0]

  // Positive fixint (0x00 - 0x7f)
  if (firstByte <= 0x7f) return firstByte

  // Negative fixint (0xe0 - 0xff)
  if (firstByte >= 0xe0) return firstByte - 256

  // uint8 (0xcc)
  if (firstByte === 0xcc && buffer.length >= 2) return buffer[1]

  // uint16 (0xcd)
  if (firstByte === 0xcd && buffer.length >= 3) {
    return new DataView(buffer.buffer, buffer.byteOffset, 3).getUint16(1, false)
  }

  // uint32 (0xce)
  if (firstByte === 0xce && buffer.length >= 5) {
    return new DataView(buffer.buffer, buffer.byteOffset, 5).getUint32(1, false)
  }

  // int8 (0xd0)
  if (firstByte === 0xd0 && buffer.length >= 2) {
    return buffer[1] > 127 ? buffer[1] - 256 : buffer[1]
  }

  // int16 (0xd1)
  if (firstByte === 0xd1 && buffer.length >= 3) {
    return new DataView(buffer.buffer, buffer.byteOffset, 3).getInt16(1, false)
  }

  // int32 (0xd2)
  if (firstByte === 0xd2 && buffer.length >= 5) {
    return new DataView(buffer.buffer, buffer.byteOffset, 5).getInt32(1, false)
  }

  return null
}

/**
 * Decompresses raw LZ4 block data
 */
export function decompressLz4(
  compressedData: Uint8Array,
  uncompressedSize: number,
): Uint8Array {
  const dst = makeBuffer(uncompressedSize)
  const actualSize = decompressLz4Block(
    compressedData,
    dst,
    0,
    compressedData.length,
    0,
  )
  return new Uint8Array(dst.slice(0, actualSize))
}

