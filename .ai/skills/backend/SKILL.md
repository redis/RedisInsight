---
name: backend
description: >-
  NestJS backend development patterns for the RedisInsight API:
  module structure, services, controllers, DTOs, dependency injection,
  and error handling. Use when editing any file under
  redisinsight/api/**, writing or modifying NestJS modules,
  controllers, services, DTOs, providers, or when the user mentions
  the backend, API, or NestJS.
---


# Backend Development (NestJS/API)

## Module Structure

### NestJS Architecture

- Follow **modular architecture** (feature-based modules)
- Use **dependency injection** throughout
- **Separate concerns**: Controllers, Services, Repositories
- Use **DTOs** for validation and data transfer
- Apply **proper error handling** with NestJS exceptions

### Module Folder Structure

Each feature module in its own directory under `api/src/`:

```
feature/
├── feature.module.ts           # Module definition
├── feature.controller.ts       # REST endpoints
├── feature.service.ts          # Business logic
├── feature.service.spec.ts     # Service tests
├── feature.controller.spec.ts  # Controller tests
├── feature.types.ts            # Interfaces and types related to the feature
├── dto/                        # Data transfer objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature.dto.ts
├── entities/                   # TypeORM entities
├── repositories/               # Custom repositories
├── exceptions/                 # Custom exceptions
├── guards/                     # Feature-specific guards
├── decorators/                 # Custom decorators
└── constants/                  # Feature constants
```

### File Naming

- **Modules**: `feature.module.ts`
- **Controllers**: `feature.controller.ts`
- **Services**: `feature.service.ts`
- **DTOs**: `create-feature.dto.ts`, `update-feature.dto.ts`
- **Entities**: `feature.entity.ts`
- **Interfaces and types**: `feature.types.ts`
- **Tests**: `feature.service.spec.ts`
- **Constants**: `feature.constants.ts`
- **Exceptions**: `feature-not-found.exception.ts`

### Constants Organization

Store feature-specific constants in dedicated constants file:

```typescript
export const FEATURE_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
} as const;

export const FEATURE_ERROR_MESSAGES = {
  NOT_FOUND: 'Feature not found',
  INVALID_INPUT: 'Invalid feature data',
} as const;
```

### Imports Order

1. Node.js built-in modules
2. External dependencies (`@nestjs/*`, etc.)
3. Internal modules (using `src/*` alias — the backend's self-reference into `redisinsight/api/src/*`)
4. Local relative imports

## Service Layer

### Service Pattern

- Inject dependencies via constructor
- Use TypeORM repositories
- Handle errors with NestJS exceptions
- Use Logger for important operations
- Keep business logic in services (not controllers)

### Dependency Injection

Always inject dependencies via constructor with proper decorators:

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}
}
```

## Controller Layer

### Controller Pattern

- Keep controllers thin (delegate to services)
- Use proper HTTP decorators (`@Get`, `@Post`, etc.)
- Use `@Body`, `@Param`, `@Query` for inputs
- Apply guards with `@UseGuards()`
- Document with Swagger decorators

### HTTP Status Codes

- Use `@HttpCode()` decorator for non-standard codes
- Return appropriate status codes (200, 201, 204, 400, 404, etc.)

## Data Transfer Objects (DTOs)

### Validation

Use `class-validator` decorators for validation:

- `@IsString()`, `@IsNumber()`, `@IsEmail()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@MinLength()`, `@MaxLength()`
- `@Min()`, `@Max()`

### Swagger Documentation

Use `@ApiProperty()` and `@ApiPropertyOptional()` for Swagger docs.

## Error Handling

### NestJS Exceptions

Use appropriate exception types:

- `NotFoundException` - 404
- `BadRequestException` - 400
- `UnauthorizedException` - 401
- `ForbiddenException` - 403
- `ConflictException` - 409
- `InternalServerErrorException` - 500

### Custom Exceptions

**Prefer custom exceptions over generic ones** when you need:

- Consistent error codes for frontend handling
- Specific error messages from constants
- Consistent error structure across the codebase

Create custom exceptions following existing patterns:

```typescript
// src/modules/feature/exceptions/feature-invalid.exception.ts
import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class FeatureInvalidException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.FEATURE_INVALID,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'FeatureInvalid',
      errorCode: CustomErrorCodes.FeatureInvalid,
    };

    super(response, response.statusCode, options);
  }
}
```

### Error Logging

```typescript
private readonly logger = new Logger(ServiceName.name)

this.logger.error('Error message', error.stack, { context })
```

## Redis Integration

### Redis Service Pattern

- Use RedisClient from `src/modules/redis`
- Handle errors gracefully
- Log Redis operations
- Use try-catch for error handling

## Code Quality

### Cognitive Complexity (≤ 15)

- Use early returns to reduce nesting
- Extract complex logic to separate functions
- Avoid deeply nested conditions

### No Duplicate Strings

Extract repeated strings to constants in constants file.

## API Documentation (Swagger)

### Required Decorators

- `@ApiTags()` - Group endpoints
- `@ApiOperation()` - Describe operation
- `@ApiResponse()` - Document responses
- `@ApiParam()` - Document params
- `@ApiQuery()` - Document query params
- `@ApiBearerAuth()` - Auth requirement

## Checklist

- [ ] Services use dependency injection
- [ ] DTOs have validation decorators
- [ ] Controllers have Swagger documentation
- [ ] Proper HTTP status codes used
- [ ] Error handling with appropriate exceptions
- [ ] Logging for important operations
- [ ] Transactions for related DB operations
- [ ] Configuration via ConfigService
- [ ] Guards for authentication/authorization
- [ ] Cognitive complexity ≤ 15
