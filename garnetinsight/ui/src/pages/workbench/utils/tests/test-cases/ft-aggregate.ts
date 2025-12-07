export const findArgumentftAggreageTests = [
  {
    args: ['index', '"query"', 'APPLY'],
    result: {
      stopArg: { name: 'expression', token: 'APPLY', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression'],
    result: {
      stopArg: { name: 'name', token: 'AS', type: 'string' },
      append: expect.any(Array),
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression', 'AS'],
    result: {
      stopArg: { name: 'name', token: 'AS', type: 'string' },
      append: expect.any(Array),
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'APPLY', 'expression', 'AS', 'name'],
    result: {
      stopArg: undefined,
      append: expect.any(Array),
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['""', '""', 'GROUPBY', '2', 'p1', 'p2', 'REDUCE', 'f'],
    result: {
      stopArg: { name: 'nargs', type: 'integer' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['""', '""', 'GROUPBY', '2', 'p1', 'p2', 'REDUCE', 'f', '0'],
    result: {
      stopArg: {
        name: 'name',
        type: 'string',
        token: 'AS',
        optional: true,
      },
      append: [
        [
          {
            name: 'name',
            type: 'string',
            token: 'AS',
            optional: true,
            parent: {
              name: 'reduce',
              type: 'block',
              optional: true,
              multiple: true,
              arguments: [
                {
                  name: 'function',
                  token: 'REDUCE',
                  type: 'string',
                },
                {
                  name: 'nargs',
                  type: 'integer',
                },
                {
                  name: 'arg',
                  type: 'string',
                  multiple: true,
                },
                {
                  name: 'name',
                  type: 'string',
                  token: 'AS',
                  optional: true,
                },
              ],
              parent: expect.any(Object),
            },
          },
        ],
        [
          {
            name: 'function',
            token: 'REDUCE',
            type: 'string',
            multiple: true,
            optional: true,
            parent: expect.any(Object),
          },
        ],
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: [
      '""',
      '""',
      'GROUPBY',
      '2',
      'p1',
      'p2',
      'REDUCE',
      'f',
      '1',
      'AS',
      'name',
    ],
    result: {
      stopArg: undefined,
      append: [
        [],
        [
          {
            name: 'function',
            token: 'REDUCE',
            type: 'string',
            multiple: true,
            optional: true,
            parent: expect.any(Object),
          },
        ],
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'SORTBY'],
    result: {
      stopArg: { name: 'nargs', token: 'SORTBY', type: 'integer' },
      append: expect.any(Array),
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'SORTBY', '1', 'p1'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true,
      },
      append: [
        [
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
            parent: expect.any(Object),
          },
        ],
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'SORTBY', '2', 'p1', 'ASC'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true,
      },
      append: [
        [
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
            parent: expect.any(Object),
          },
        ],
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'SORTBY', '0'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true,
      },
      append: [
        [
          {
            name: 'num',
            type: 'integer',
            token: 'MAX',
            optional: true,
            parent: expect.any(Object),
          },
        ],
      ],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'SORTBY', '2', 'p1', 'ASC', 'MAX'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'MAX',
        optional: true,
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'LOAD', '4'],
    result: {
      stopArg: { multiple: true, name: 'field', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'LOAD', '4', '1', '2', '3'],
    result: {
      stopArg: { multiple: true, name: 'field', type: 'string' },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['index', '"query"', 'LOAD', '4', '1', '2', '3', '4'],
    result: {
      stopArg: undefined,
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
]
