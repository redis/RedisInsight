import { ApiProperty } from '@nestjs/swagger';

export const REDIS_STRING_SCHEMA = {
  type: String,
  oneOf: [
    { type: 'string' },
    {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['Buffer'], example: 'Buffer' },
        data: {
          type: 'array',
          items: { type: 'number' },
          example: [61, 101, 49],
        },
      },
      required: ['type', 'data'],
    },
  ],
};

export const ApiRedisString = (
  description?: string,
  isArray = false,
  required = true,
) =>
  ApiProperty({
    description,
    isArray,
    required,
    ...REDIS_STRING_SCHEMA,
  });
