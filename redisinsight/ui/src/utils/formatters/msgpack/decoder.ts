/**
 * MessagePack decoder with LZ4 decompression support
 */

import { Unpackr } from 'msgpackr'

import { isLz4SizeMarker, decompressLz4 } from './lz4'
// Import extensions module to ensure handlers are registered
import './extensions'

/**
 * Post-processes decoded data to find and decompress LZ4 patterns
 *
 * Looks for:
 * 1. [Lz4SizeMarker, Uint8Array] arrays (array format)
 * 2. Lz4SizeMarker with compressedData (inline format)
 */
function postProcessLz4(value: unknown, decoder: Unpackr): unknown {
  // Handle inline format markers with embedded compressed data
  if (isLz4SizeMarker(value) && value.compressedData) {
    const decompressed = decompressLz4(value.compressedData, value.size)
    const decoded = decoder.unpack(decompressed)
    return postProcessLz4(decoded, decoder)
  }

  // Handle array format: [Lz4SizeMarker, Uint8Array]
  if (Array.isArray(value) && value.length === 2) {
    const [first, second] = value
    if (isLz4SizeMarker(first) && second instanceof Uint8Array) {
      const decompressed = decompressLz4(second, first.size)
      const decoded = decoder.unpack(decompressed)
      return postProcessLz4(decoded, decoder)
    }
  }

  // Recursively process arrays
  if (Array.isArray(value)) {
    return value.map((item) => postProcessLz4(item, decoder))
  }

  // Recursively process objects
  if (typeof value === 'object' && value !== null && !(value instanceof Uint8Array)) {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = postProcessLz4(val, decoder)
    }
    return result
  }

  return value
}

// Singleton decoder instance
const decoder = new Unpackr({
  useRecords: false,
  mapsAsObjects: true,
})

/**
 * Decodes msgpack data with LZ4 decompression support
 *
 * This function must be used instead of directly using msgpackr's Unpackr
 * because the extension handlers only return markers that need to be
 * post-processed to actually decompress the LZ4 data.
 */
export function decodeMsgpackWithLz4(buffer: Uint8Array): unknown {
  const decoded = decoder.unpack(buffer)
  return postProcessLz4(decoded, decoder)
}

