export const findArgumentftSearchTests = [
  {
    args: ['', '', 'SUMMARIZE'],
    result: {
      stopArg: {
        name: 'fields',
        type: 'block',
        optional: true,
        arguments: [
          {
            name: 'count',
            type: 'string',
            token: 'FIELDS',
          },
          {
            name: 'field',
            type: 'string',
            multiple: true,
          },
        ],
      },
      append: [
        [
          {
            name: 'count',
            type: 'string',
            token: 'FIELDS',
            optional: true,
            parent: expect.any(Object),
          },
          {
            name: 'num',
            type: 'integer',
            token: 'FRAGS',
            optional: true,
            parent: expect.any(Object),
          },
          {
            name: 'fragsize',
            type: 'integer',
            token: 'LEN',
            optional: true,
            parent: expect.any(Object),
          },
          {
            name: 'separator',
            type: 'string',
            token: 'SEPARATOR',
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
    args: ['', '', 'SUMMARIZE', 'FIELDS'],
    result: {
      stopArg: {
        name: 'count',
        type: 'string',
        token: 'FIELDS',
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1'],
    result: {
      stopArg: {
        name: 'field',
        type: 'string',
        multiple: true,
      },
      append: [],
      isBlocked: true,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1', 'f', 'FRAGS'],
    result: {
      stopArg: {
        name: 'num',
        type: 'integer',
        token: 'FRAGS',
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
    args: ['', '', 'SUMMARIZE', 'FIELDS', '1', 'f', 'FRAGS', '10'],
    result: {
      stopArg: {
        name: 'fragsize',
        type: 'integer',
        token: 'LEN',
        optional: true,
      },
      append: [
        [
          {
            name: 'fragsize',
            type: 'integer',
            token: 'LEN',
            optional: true,
            parent: expect.any(Object),
          },
          {
            name: 'separator',
            type: 'string',
            token: 'SEPARATOR',
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
    args: ['', '', 'RETURN', '1', 'iden'],
    result: {
      stopArg: expect.any(Object),
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'RETURN', '2', 'iden'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true,
      },
      append: [
        [
          {
            name: 'property',
            type: 'string',
            token: 'AS',
            optional: true,
            parent: expect.any(Object),
          },
        ],
        [],
      ],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'RETURN', '2', 'iden', 'iden'],
    result: {
      stopArg: undefined,
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'RETURN', '3', 'iden', 'iden'],
    result: {
      stopArg: {
        name: 'property',
        type: 'string',
        token: 'AS',
        optional: true,
      },
      append: [
        [
          {
            name: 'property',
            type: 'string',
            token: 'AS',
            optional: true,
            parent: expect.any(Object),
          },
        ],
        [],
      ],
      isBlocked: false,
      isComplete: false,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'RETURN', '3', 'iden', 'iden', 'AS', 'iden2'],
    result: {
      stopArg: undefined,
      append: [],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'SORTBY', 'f'],
    result: {
      stopArg: {
        name: 'order',
        type: 'oneof',
        optional: true,
        arguments: [
          {
            name: 'asc',
            type: 'pure-token',
            token: 'ASC',
          },
          {
            name: 'desc',
            type: 'pure-token',
            token: 'DESC',
          },
        ],
      },
      append: [
        [
          {
            name: 'asc',
            type: 'pure-token',
            token: 'ASC',
            parent: expect.any(Object),
          },
          {
            name: 'desc',
            type: 'pure-token',
            token: 'DESC',
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
    args: ['', '', 'SORTBY', 'f', 'DESC'],
    result: {
      stopArg: undefined,
      append: [[]],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
  {
    args: ['', '', 'DIALECT', '1'],
    result: {
      stopArg: undefined,
      append: [[]],
      isBlocked: false,
      isComplete: true,
      parent: expect.any(Object),
      token: expect.any(Object),
    },
  },
]
