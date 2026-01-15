/**
 * MessagePack extension handlers for .NET MessagePack-CSharp LZ4 compression
 *
 * The .NET MessagePack library uses extension types 98 and 99 for LZ4 compression:
 * - Type 98 (Lz4BlockArray): Array of LZ4 compressed blocks
 * - Type 99 (Lz4Block): Single LZ4 compressed block
 *
 * Supported LZ4BlockArray formats (type 98):
 *
 * Format 1 - Array format (most common):
 *   [Ext(98, msgpack_int(uncompressed_size)), bin(compressed_data)]
 *   - 2-element msgpack array
 *   - First element: ext type 98 with uncompressed size as msgpack integer
 *   - Second element: binary with LZ4 compressed data
 *
 * Format 2 - Inline format:
 *   Ext(98, [4-byte-big-endian-size, compressed_data...])
 *   - Single ext with size and data packed together
 *
 * @see https://github.com/MessagePack-CSharp/MessagePack-CSharp#lz4-compression
 */

import { addExtension } from 'msgpackr'

import {
  Lz4SizeMarker,
  LZ4_SIZE_MARKER,
  readMsgpackInt,
} from './lz4'

// Extension type codes used by .NET MessagePack-CSharp
const LZ4_BLOCK_ARRAY_TYPE = 98
const LZ4_BLOCK_TYPE = 99

/**
 * Extension handler for LZ4BlockArray (type 98)
 *
 * The ext payload can be:
 * 1. Just a msgpack-encoded size (array format) - compressed data is sibling element
 * 2. 4-byte size + compressed data (inline format)
 */
function handleLz4BlockArrayExt(data: Uint8Array): Lz4SizeMarker {
  // Try to read as msgpack integer first (array format)
  const msgpackSize = readMsgpackInt(data)
  if (msgpackSize !== null && msgpackSize > 0 && msgpackSize < 100_000_000) {
    // Looks like a reasonable size - this is likely the array format
    // where compressed data will be the next element in the parent array
    return { [LZ4_SIZE_MARKER]: true, size: msgpackSize }
  }

  // Try inline format: 4-byte big-endian size + compressed data
  if (data.length >= 5) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    const size = view.getInt32(0, false)
    if (size > 0 && size < 100_000_000) {
      const compressedData = data.slice(4)
      return { [LZ4_SIZE_MARKER]: true, size, compressedData }
    }
  }

  // Fallback: treat first byte(s) as size
  return { [LZ4_SIZE_MARKER]: true, size: data[0] }
}

/**
 * Extension handler for LZ4Block (type 99)
 * Format: 4-byte big-endian size + compressed data
 */
function handleLz4BlockExt(data: Uint8Array): Lz4SizeMarker {
  if (data.length >= 5) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    const size = view.getInt32(0, false)
    const compressedData = data.slice(4)
    return { [LZ4_SIZE_MARKER]: true, size, compressedData }
  }
  return { [LZ4_SIZE_MARKER]: true, size: 0 }
}

/**
 * Register extension handlers globally
 *
 * NOTE: This has side effects - it affects all Unpackr instances.
 * The handlers return marker objects that must be post-processed
 * by decodeMsgpackWithLz4() to actually decompress the data.
 */
export function registerLz4Extensions(): void {
  addExtension({
    type: LZ4_BLOCK_ARRAY_TYPE,
    unpack: handleLz4BlockArrayExt,
  })

  addExtension({
    type: LZ4_BLOCK_TYPE,
    unpack: handleLz4BlockExt,
  })
}

// Register extensions when this module is imported
registerLz4Extensions()

