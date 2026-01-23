import {
  LZ4_SIZE_MARKER,
  isLz4SizeMarker,
  readMsgpackInt,
  decompressLz4,
} from './lz4'

describe('lz4', () => {
  describe('isLz4SizeMarker', () => {
    it('should return true for valid Lz4SizeMarker', () => {
      const marker = { [LZ4_SIZE_MARKER]: true, size: 100 }
      expect(isLz4SizeMarker(marker)).toBe(true)
    })

    it('should return true for marker with compressedData', () => {
      const marker = {
        [LZ4_SIZE_MARKER]: true,
        size: 100,
        compressedData: new Uint8Array([1, 2, 3]),
      }
      expect(isLz4SizeMarker(marker)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isLz4SizeMarker(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isLz4SizeMarker(undefined)).toBe(false)
    })

    it('should return false for primitive values', () => {
      expect(isLz4SizeMarker(123)).toBe(false)
      expect(isLz4SizeMarker('string')).toBe(false)
      expect(isLz4SizeMarker(true)).toBe(false)
    })

    it('should return false for regular objects', () => {
      expect(isLz4SizeMarker({ size: 100 })).toBe(false)
      expect(isLz4SizeMarker({ foo: 'bar' })).toBe(false)
    })

    it('should return false for arrays', () => {
      expect(isLz4SizeMarker([1, 2, 3])).toBe(false)
    })
  })

  describe('readMsgpackInt', () => {
    it('should return null for empty buffer', () => {
      expect(readMsgpackInt(new Uint8Array([]))).toBeNull()
    })

    describe('positive fixint (0x00 - 0x7f)', () => {
      it('should read 0', () => {
        expect(readMsgpackInt(new Uint8Array([0x00]))).toBe(0)
      })

      it('should read 127', () => {
        expect(readMsgpackInt(new Uint8Array([0x7f]))).toBe(127)
      })

      it('should read 42', () => {
        expect(readMsgpackInt(new Uint8Array([0x2a]))).toBe(42)
      })
    })

    describe('negative fixint (0xe0 - 0xff)', () => {
      it('should read -1', () => {
        expect(readMsgpackInt(new Uint8Array([0xff]))).toBe(-1)
      })

      it('should read -32', () => {
        expect(readMsgpackInt(new Uint8Array([0xe0]))).toBe(-32)
      })

      it('should read -10', () => {
        expect(readMsgpackInt(new Uint8Array([0xf6]))).toBe(-10)
      })
    })

    describe('uint8 (0xcc)', () => {
      it('should read 128', () => {
        expect(readMsgpackInt(new Uint8Array([0xcc, 0x80]))).toBe(128)
      })

      it('should read 255', () => {
        expect(readMsgpackInt(new Uint8Array([0xcc, 0xff]))).toBe(255)
      })

      it('should return null if buffer too short', () => {
        expect(readMsgpackInt(new Uint8Array([0xcc]))).toBeNull()
      })
    })

    describe('uint16 (0xcd)', () => {
      it('should read 256', () => {
        expect(readMsgpackInt(new Uint8Array([0xcd, 0x01, 0x00]))).toBe(256)
      })

      it('should read 65535', () => {
        expect(readMsgpackInt(new Uint8Array([0xcd, 0xff, 0xff]))).toBe(65535)
      })

      it('should return null if buffer too short', () => {
        expect(readMsgpackInt(new Uint8Array([0xcd, 0x01]))).toBeNull()
      })
    })

    describe('uint32 (0xce)', () => {
      it('should read 65536', () => {
        expect(
          readMsgpackInt(new Uint8Array([0xce, 0x00, 0x01, 0x00, 0x00])),
        ).toBe(65536)
      })

      it('should read large number', () => {
        expect(
          readMsgpackInt(new Uint8Array([0xce, 0x00, 0x0f, 0x42, 0x40])),
        ).toBe(1000000)
      })

      it('should return null if buffer too short', () => {
        expect(
          readMsgpackInt(new Uint8Array([0xce, 0x00, 0x01, 0x00])),
        ).toBeNull()
      })
    })

    describe('int8 (0xd0)', () => {
      it('should read -128', () => {
        expect(readMsgpackInt(new Uint8Array([0xd0, 0x80]))).toBe(-128)
      })

      it('should read -1', () => {
        expect(readMsgpackInt(new Uint8Array([0xd0, 0xff]))).toBe(-1)
      })

      it('should read positive value', () => {
        expect(readMsgpackInt(new Uint8Array([0xd0, 0x7f]))).toBe(127)
      })
    })

    describe('int16 (0xd1)', () => {
      it('should read -32768', () => {
        expect(readMsgpackInt(new Uint8Array([0xd1, 0x80, 0x00]))).toBe(-32768)
      })

      it('should read -1', () => {
        expect(readMsgpackInt(new Uint8Array([0xd1, 0xff, 0xff]))).toBe(-1)
      })
    })

    describe('int32 (0xd2)', () => {
      it('should read -1', () => {
        expect(
          readMsgpackInt(new Uint8Array([0xd2, 0xff, 0xff, 0xff, 0xff])),
        ).toBe(-1)
      })

      it('should read negative number', () => {
        expect(
          readMsgpackInt(new Uint8Array([0xd2, 0xff, 0xf0, 0xbd, 0xc0])),
        ).toBe(-1000000)
      })
    })

    describe('unsupported formats', () => {
      it('should return null for unsupported type', () => {
        // 0xc0 is nil in msgpack, not an integer
        expect(readMsgpackInt(new Uint8Array([0xc0]))).toBeNull()
      })

      it('should return null for string marker', () => {
        // 0xa1 is fixstr
        expect(readMsgpackInt(new Uint8Array([0xa1, 0x61]))).toBeNull()
      })
    })
  })

  describe('decompressLz4', () => {
    it('should decompress simple LZ4 data', () => {
      // LZ4 compressed "hello" (raw block format)
      // This is a literal-only block: 0x50 = literal length 5, followed by "hello"
      const compressed = new Uint8Array([0x50, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
      const result = decompressLz4(compressed, 5)

      expect(result).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f])) // "hello"
    })

    it('should decompress longer literal data', () => {
      // LZ4 compressed "hello world" (literal-only block)
      // 0xB0 = literal length 11, followed by "hello world"
      const text = 'hello world'
      const encoder = new TextEncoder()
      const textBytes = encoder.encode(text)
      const compressed = new Uint8Array([0xb0, ...textBytes])
      const result = decompressLz4(compressed, text.length)

      expect(new TextDecoder().decode(result)).toBe('hello world')
    })
  })
})
