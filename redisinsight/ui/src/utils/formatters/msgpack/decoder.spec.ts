import { decodeMsgpackWithLz4 } from './decoder'

describe('decoder', () => {
  describe('decodeMsgpackWithLz4', () => {
    describe('standard msgpack (no LZ4)', () => {
      it('should decode simple object', () => {
        // MessagePack for { "name": "test", "value": 123 }
        const data = new Uint8Array([
          0x82, // fixmap with 2 elements
          0xa4,
          0x6e,
          0x61,
          0x6d,
          0x65, // "name" (fixstr)
          0xa4,
          0x74,
          0x65,
          0x73,
          0x74, // "test" (fixstr)
          0xa5,
          0x76,
          0x61,
          0x6c,
          0x75,
          0x65, // "value" (fixstr)
          0x7b, // 123 (positive fixint)
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual({ name: 'test', value: 123 })
      })

      it('should decode array', () => {
        // MessagePack for [1, 2, 3]
        const data = new Uint8Array([0x93, 0x01, 0x02, 0x03])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual([1, 2, 3])
      })

      it('should decode nested object', () => {
        // MessagePack for { "outer": { "inner": 42 } }
        const data = new Uint8Array([
          0x81, // fixmap with 1 element
          0xa5,
          0x6f,
          0x75,
          0x74,
          0x65,
          0x72, // "outer"
          0x81, // fixmap with 1 element
          0xa5,
          0x69,
          0x6e,
          0x6e,
          0x65,
          0x72, // "inner"
          0x2a, // 42
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual({ outer: { inner: 42 } })
      })

      it('should decode deeply nested arrays', () => {
        // MessagePack for [[1, 2], [3, 4]]
        const data = new Uint8Array([
          0x92, // fixarray with 2 elements
          0x92,
          0x01,
          0x02, // [1, 2]
          0x92,
          0x03,
          0x04, // [3, 4]
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual([
          [1, 2],
          [3, 4],
        ])
      })

      it('should decode mixed types', () => {
        // MessagePack for { "arr": [1, "two"], "num": 3 }
        const data = new Uint8Array([
          0x82, // fixmap with 2 elements
          0xa3,
          0x61,
          0x72,
          0x72, // "arr"
          0x92,
          0x01,
          0xa3,
          0x74,
          0x77,
          0x6f, // [1, "two"]
          0xa3,
          0x6e,
          0x75,
          0x6d, // "num"
          0x03, // 3
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual({ arr: [1, 'two'], num: 3 })
      })
    })

    describe('edge cases', () => {
      it('should decode empty map', () => {
        const data = new Uint8Array([0x80]) // fixmap with 0 elements
        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual({})
      })

      it('should decode empty array', () => {
        const data = new Uint8Array([0x90]) // fixarray with 0 elements
        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual([])
      })

      it('should decode null', () => {
        const data = new Uint8Array([0xc0]) // nil
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBeNull()
      })

      it('should decode boolean true', () => {
        const data = new Uint8Array([0xc3]) // true
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe(true)
      })

      it('should decode boolean false', () => {
        const data = new Uint8Array([0xc2]) // false
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe(false)
      })

      it('should decode string', () => {
        // "hello"
        const data = new Uint8Array([0xa5, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe('hello')
      })

      it('should decode negative integer', () => {
        // -1 (negative fixint)
        const data = new Uint8Array([0xff])
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe(-1)
      })

      it('should decode float', () => {
        // MessagePack float32 for 3.14 (approximately)
        const data = new Uint8Array([0xca, 0x40, 0x48, 0xf5, 0xc3])
        const result = decodeMsgpackWithLz4(data)
        expect(result).toBeCloseTo(3.14, 2)
      })

      it('should decode binary data', () => {
        // MessagePack bin8 with 3 bytes
        const data = new Uint8Array([0xc4, 0x03, 0x01, 0x02, 0x03])
        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual(new Uint8Array([0x01, 0x02, 0x03]))
      })
    })

    describe('LZ4 compressed data', () => {
      it('should decode inline LZ4Block format (type 99)', () => {
        // This is the inline format where compressed data is in the ext payload
        // ext8 with type 99, 4-byte size + LZ4 compressed data
        // Compressed content: msgpack for 42 (0x2a)
        const data = new Uint8Array([
          0xc7, // ext8
          0x06, // payload length: 6 bytes (4 size + 2 compressed)
          0x63, // type 99 (0x63)
          0x00,
          0x00,
          0x00,
          0x01, // uncompressed size: 1
          0x10,
          0x2a, // LZ4 compressed: literal 1 byte, value 0x2a (42)
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe(42)
      })

      it('should decode inline LZ4BlockArray format (type 98)', () => {
        // ext8 with type 98, 4-byte size + LZ4 compressed data
        // Compressed content: msgpack for "hi" (0xa2 0x68 0x69)
        const data = new Uint8Array([
          0xc7, // ext8
          0x08, // payload length: 8 bytes (4 size + 4 compressed)
          0x62, // type 98 (0x62)
          0x00,
          0x00,
          0x00,
          0x03, // uncompressed size: 3
          0x30,
          0xa2,
          0x68,
          0x69, // LZ4: literal 3 bytes, "hi" msgpack
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe('hi')
      })

      it('should decode array format LZ4BlockArray [ext(98, size), bin]', () => {
        // Array format: [Ext(98, msgpack_size), binary_compressed_data]
        // This is the format used by MessagePack-CSharp
        // Compressed content: msgpack for 123 (0x7b)
        const data = new Uint8Array([
          0x92, // fixarray with 2 elements
          0xd4, // fixext1 (1-byte payload)
          0x62, // type 98
          0x01, // size: 1 (msgpack positive fixint)
          0xc4, // bin8
          0x02, // binary length: 2
          0x10,
          0x7b, // LZ4 compressed: literal 1 byte, value 0x7b (123)
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe(123)
      })

      it('should decode array format with larger size (uint8)', () => {
        // Size encoded as msgpack uint8 (0xcc)
        // Compressed content: msgpack for "test" (0xa4 + "test")
        const data = new Uint8Array([
          0x92, // fixarray with 2 elements
          0xd5, // fixext2 (2-byte payload)
          0x62, // type 98
          0xcc,
          0x05, // size: 5 (msgpack uint8)
          0xc4, // bin8
          0x06, // binary length: 6
          0x50,
          0xa4,
          0x74,
          0x65,
          0x73,
          0x74, // LZ4: literal 5 bytes
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toBe('test')
      })

      it('should decode nested object from LZ4', () => {
        // Compressed content: msgpack for { "a": 1 }
        // 81 a1 61 01 = fixmap(1), fixstr(1) "a", fixint 1
        const data = new Uint8Array([
          0x92, // fixarray with 2 elements
          0xd4, // fixext1
          0x62, // type 98
          0x04, // size: 4
          0xc4, // bin8
          0x05, // binary length: 5
          0x40,
          0x81,
          0xa1,
          0x61,
          0x01, // LZ4: literal 4 bytes
        ])

        const result = decodeMsgpackWithLz4(data)
        expect(result).toEqual({ a: 1 })
      })
    })

    describe('error handling', () => {
      it('should throw on invalid msgpack data', () => {
        const invalidData = new Uint8Array([0xff, 0xff, 0xff])
        expect(() => decodeMsgpackWithLz4(invalidData)).toThrow()
      })
    })
  })
})
