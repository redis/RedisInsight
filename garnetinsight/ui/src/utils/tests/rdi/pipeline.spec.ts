import { isEqualPipelineFile } from 'uiSrc/utils'

const isEqualPipelineFileTests: [[string, string], boolean][] = [
  [['', ''], true],
  [[':', ':'], false],
  [
    [
      `
  source:
    server_name: localhost
    schema: public
    table: employee
    row_format: full
  `,
      `
  source:
    server_name: localhost
    schema: public
    table: employee
    row_format: full
  `,
    ],
    true,
  ],
  [
    [
      `
  source:
    server_name: localhost
      schema: public
    table: employee
    row_format: full
  `,
      `
  source:
    server_name: localhost
    schema: public
    table: employee
    row_format: full
  `,
    ],
    false,
  ],
  [
    [
      `
  source:
    server_name: localhost
    schema: public
    table: employee
    row_format: full
  `,
      `
  source:
    server_name: localhost
    table: employee
    schema: public
    row_format: full
  `,
    ],
    true,
  ],
  [
    [
      `
  source:
    server_name: localhost
    schema: public
    # some
    table: employee
    row_format: full
    #comment
  `,
      `
  source:
    server_name: localhost
    table: employee
    #foo bar
    schema: public
    row_format: full
  `,
    ],
    true,
  ],
]

describe('isEqualPipelineFile', () => {
  it.each(isEqualPipelineFileTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = isEqualPipelineFile(...input)
      expect(result).toBe(expected)
    },
  )
})
