import { OpenAPIObject } from '@nestjs/swagger';

const SWAGGER_CONFIG: Omit<OpenAPIObject, 'paths'> = {
  openapi: '3.0.0',
  info: {
    title: 'Garnet Insight Backend API',
    description: 'Garnet Insight Backend API',
    version: '3.0.0',
  },
  tags: [],
};

export default SWAGGER_CONFIG;
