import { OpenAPIObject } from '@nestjs/swagger';

const SWAGGER_CONFIG: Omit<OpenAPIObject, 'paths'> = {
  openapi: '3.0.0',
  info: {
    title: 'Redis Insight Backend API',
    description: 'Redis Insight Backend API',
    version: '2.70.1',
  },
  tags: [],
};

export default SWAGGER_CONFIG;
