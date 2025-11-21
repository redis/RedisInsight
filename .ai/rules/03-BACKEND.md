# Backend Development (NestJS/API)

## Table of Contents
1. [Module Structure & Organization](#module-structure--organization)
2. [Service Layer](#service-layer)
3. [Controller Layer](#controller-layer)
4. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
5. [Error Handling](#error-handling)
6. [Redis Integration](#redis-integration)
7. [Database Operations](#database-operations)
8. [API Documentation (Swagger)](#api-documentation-swagger)
9. [Best Practices](#best-practices)
10. [Common Pitfalls](#common-pitfalls)

---

## Module Structure & Organization

### NestJS Architecture Principles
- Follow **modular architecture** (feature-based modules)
- Use **dependency injection** throughout
- **Separate concerns**: Controllers, Services, Repositories
- Use **DTOs** for validation and data transfer
- Apply **proper error handling** with NestJS exceptions

### Module Folder Structure

Each feature module should be organized in its own directory under `redisinsight/api/src/`. The directory should contain:

```
feature/
├── feature.module.ts           # Module definition
├── feature.controller.ts       # REST endpoints
├── feature.service.ts          # Business logic
├── feature.service.spec.ts     # Service unit tests
├── feature.controller.spec.ts  # Controller unit tests
├── dto/                        # Data transfer objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   ├── feature.dto.ts
│   └── index.ts               # Barrel file (3+ exports)
├── entities/                   # TypeORM entities
│   ├── feature.entity.ts
│   └── index.ts
├── repositories/               # Custom repositories (if needed)
│   └── feature.repository.ts
├── exceptions/                 # Custom exceptions
│   └── feature-not-found.exception.ts
├── guards/                     # Feature-specific guards
│   └── feature-access.guard.ts
├── decorators/                 # Custom decorators
│   └── feature-context.decorator.ts
└── constants/                  # Feature constants
    └── feature.constants.ts
```

#### Example Structure

```
user/
├── user.module.ts
├── user.controller.ts
├── user.service.ts
├── user.service.spec.ts
├── user.controller.spec.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── user.dto.ts
│   └── index.ts
├── entities/
│   ├── user.entity.ts
│   ├── user-profile.entity.ts
│   └── index.ts
├── repositories/
│   └── user.repository.ts
├── exceptions/
│   ├── user-not-found.exception.ts
│   └── user-already-exists.exception.ts
├── guards/
│   └── user-ownership.guard.ts
└── constants/
    └── user.constants.ts
```

### File Naming Conventions

- **Module files**: `feature.module.ts`
- **Controller files**: `feature.controller.ts`
- **Service files**: `feature.service.ts`
- **DTO files**: `create-feature.dto.ts`, `update-feature.dto.ts`, `feature.dto.ts`
- **Entity files**: `feature.entity.ts`
- **Test files**: `feature.service.spec.ts`, `feature.controller.spec.ts`
- **Constants**: `feature.constants.ts`
- **Exceptions**: `feature-not-found.exception.ts`

### Module Pattern
```typescript
// feature.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeatureController } from './feature.controller'
import { FeatureService } from './feature.service'
import { FeatureEntity } from './entities/feature.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if used by other modules
})
export class FeatureModule {}
```

### Constants Organization

Store feature-specific constants in a dedicated constants file:

```typescript
// feature.constants.ts
export const FEATURE_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  MIN_NAME_LENGTH: 3,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const FEATURE_ERROR_MESSAGES = {
  NOT_FOUND: 'Feature not found',
  ALREADY_EXISTS: 'Feature already exists',
  INVALID_INPUT: 'Invalid feature data',
  UNAUTHORIZED: 'Not authorized to access this feature',
} as const

export const FEATURE_REDIS_KEYS = {
  PREFIX: 'feature:',
  LIST: 'feature:list',
  DETAILS: (id: string) => `feature:${id}`,
} as const
```

### Barrel Files (index.ts)

Use barrel files for exporting **3 or more** related items:

#### ✅ Good (3+ exports)

```typescript
// dto/index.ts
export { CreateFeatureDto } from './create-feature.dto'
export { UpdateFeatureDto } from './update-feature.dto'
export { FeatureDto } from './feature.dto'
export { FeatureResponseDto } from './feature-response.dto'
```

#### ❌ Bad (less than 3 exports)

```typescript
// dto/index.ts
export { CreateFeatureDto } from './create-feature.dto'
export { UpdateFeatureDto } from './update-feature.dto'
```

### Imports Order

```typescript
// 1. Node.js built-in modules
import { readFile } from 'fs/promises'

// 2. External dependencies
import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

// 3. Internal modules (using aliases)
import { RedisClient } from 'apiSrc/modules/redis/redis.client'
import { ConfigService } from 'apiSrc/config/config.service'

// 4. Local imports (relative)
import { CreateFeatureDto, UpdateFeatureDto } from './dto'
import { FeatureEntity } from './entities/feature.entity'
import { FEATURE_ERROR_MESSAGES } from './constants/feature.constants'
```

---

## Service Layer

### Service Pattern
```typescript
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FeatureEntity } from './entities/feature.entity'
import { CreateFeatureDto, UpdateFeatureDto } from './dto'

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repository: Repository<FeatureEntity>,
  ) {}

  async findAll(): Promise<FeatureEntity[]> {
    try {
      return await this.repository.find()
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch features')
    }
  }

  async findById(id: string): Promise<FeatureEntity> {
    const entity = await this.repository.findOne({ where: { id } })
    
    if (!entity) {
      throw new NotFoundException(`Feature with ID ${id} not found`)
    }
    
    return entity
  }

  async create(dto: CreateFeatureDto): Promise<FeatureEntity> {
    try {
      const entity = this.repository.create(dto)
      return await this.repository.save(entity)
    } catch (error) {
      throw new InternalServerErrorException('Failed to create feature')
    }
  }

  async update(id: string, dto: UpdateFeatureDto): Promise<FeatureEntity> {
    await this.findById(id) // Verify exists
    
    try {
      await this.repository.update(id, dto)
      return await this.findById(id)
    } catch (error) {
      throw new InternalServerErrorException('Failed to update feature')
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id)
    
    if (result.affected === 0) {
      throw new NotFoundException(`Feature with ID ${id} not found`)
    }
  }
}
```

### Dependency Injection
```typescript
// ✅ GOOD: Inject dependencies via constructor
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}
}

// ❌ BAD: Direct instantiation
export class UserService {
  private emailService = new EmailService() // Don't do this
}
```

## Controller Layer

### Controller Pattern
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { FeatureService } from './feature.service'
import { CreateFeatureDto, UpdateFeatureDto, FeatureDto } from './dto'
import { AuthGuard } from '../auth/guards/auth.guard'

@ApiTags('Features')
@Controller('api/features')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: 200, type: [FeatureDto] })
  async findAll(): Promise<FeatureDto[]> {
    return this.service.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiResponse({ status: 200, type: FeatureDto })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async findById(@Param('id') id: string): Promise<FeatureDto> {
    return this.service.findById(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new feature' })
  @ApiResponse({ status: 201, type: FeatureDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateFeatureDto): Promise<FeatureDto> {
    return this.service.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feature' })
  @ApiResponse({ status: 200, type: FeatureDto })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureDto,
  ): Promise<FeatureDto> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete feature' })
  @ApiResponse({ status: 204, description: 'Successfully deleted' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.service.delete(id)
  }
}
```

## Data Transfer Objects (DTOs)

### Validation with class-validator
```typescript
import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name', example: 'New Feature' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiProperty({ description: 'Feature value' })
  @IsString()
  @IsNotEmpty()
  value: string
}

export class UpdateFeatureDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string
}

export class FeatureDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  value: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
```

## Error Handling

### NestJS Exceptions
```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common'

// ✅ GOOD: Use appropriate exception types
async findUser(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } })
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`)
  }
  
  return user
}

async createUser(dto: CreateUserDto): Promise<User> {
  const existing = await this.userRepository.findOne({ 
    where: { email: dto.email } 
  })
  
  if (existing) {
    throw new ConflictException('User with this email already exists')
  }
  
  try {
    return await this.userRepository.save(dto)
  } catch (error) {
    throw new InternalServerErrorException('Failed to create user')
  }
}

// ✅ GOOD: Custom exception filters
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    })
  }
}
```

### Error Logging
```typescript
import { Logger } from '@nestjs/common'

export class FeatureService {
  private readonly logger = new Logger(FeatureService.name)

  async processData(data: Data): Promise<Result> {
    try {
      return await this.externalService.process(data)
    } catch (error) {
      this.logger.error(
        `Failed to process data: ${error.message}`,
        error.stack,
        { data }
      )
      throw new InternalServerErrorException('Processing failed')
    }
  }
}
```

## Redis Integration

### Redis Service Pattern
```typescript
import { Injectable, Logger } from '@nestjs/common'
import { RedisClient } from 'apiSrc/modules/redis/redis.client'

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)

  constructor(private readonly redisClient: RedisClient) {}

  async executeCommand(command: string, args: string[]): Promise<any> {
    try {
      const client = await this.redisClient.getClient()
      const result = await client.call(command, ...args)
      return this.formatResult(result)
    } catch (error) {
      this.logger.error(`Redis command failed: ${command}`, error.stack)
      throw new BadRequestException(`Redis error: ${error.message}`)
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key)
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error.stack)
      throw new InternalServerErrorException('Redis operation failed')
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.setex(key, ttl, value)
      } else {
        await this.redisClient.set(key, value)
      }
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error.stack)
      throw new InternalServerErrorException('Redis operation failed')
    }
  }
}
```

## Database Operations

### Transactions
```typescript
import { DataSource } from 'typeorm'

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUserWithProfile(userData: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const user = await queryRunner.manager.save(User, userData)
      await queryRunner.manager.save(Profile, { userId: user.id })
      
      await queryRunner.commitTransaction()
      return user
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new InternalServerErrorException('Transaction failed')
    } finally {
      await queryRunner.release()
    }
  }
}
```

## Code Quality Rules (SonarJS)

### Cognitive Complexity (≤ 15 for API)
```typescript
// ✅ GOOD: Low complexity
async validateUser(email: string, password: string): Promise<User> {
  const user = await this.findByEmail(email)
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials')
  }
  
  const isValid = await this.comparePasswords(password, user.password)
  
  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials')
  }
  
  return user
}

// ❌ BAD: High complexity (nested conditions)
async processUser(user: User): Promise<Result> {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        if (user.subscription) {
          // Too deeply nested
        }
      }
    }
  }
}

// ✅ GOOD: Refactored with early returns
async processUser(user: User): Promise<Result> {
  if (!user) throw new NotFoundException('User not found')
  if (!user.isActive) throw new BadRequestException('User inactive')
  if (!user.hasPermission) throw new ForbiddenException('No permission')
  if (!user.subscription) throw new BadRequestException('No subscription')
  
  return this.process(user)
}
```

### No Duplicate Strings
```typescript
// ❌ BAD: Duplicate strings
throw new NotFoundException('Entity not found')
throw new NotFoundException('Entity not found')
throw new NotFoundException('Entity not found')

// ✅ GOOD: Constants
const ERROR_MESSAGES = {
  ENTITY_NOT_FOUND: 'Entity not found',
  INVALID_INPUT: 'Invalid input provided',
  UNAUTHORIZED: 'Unauthorized access',
} as const

throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND)
```

## API Documentation (Swagger)

### Comprehensive Documentation
```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

@ApiTags('Users')
@Controller('api/users')
export class UserController {
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async findById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findById(id)
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Page number',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Items per page',
    example: 10
  })
  @ApiResponse({ status: 200, type: [UserDto] })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<UserDto[]> {
    return this.userService.findAll(page, limit)
  }
}
```

## Best Practices

### Logging
```typescript
// ✅ GOOD: Use NestJS Logger
private readonly logger = new Logger(ServiceName.name)

this.logger.log('Processing started')
this.logger.debug('Debug info', { data })
this.logger.warn('Warning message')
this.logger.error('Error occurred', error.stack)

// ❌ BAD: console.log
console.log('Processing started') // Don't use in production
```

### Configuration
```typescript
// ✅ GOOD: Use ConfigService
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL')
  }
}
```

### Guards and Interceptors
```typescript
// Guard for authentication
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    return this.validateRequest(request)
  }

  private validateRequest(request: any): boolean {
    // Validation logic
    return true
  }
}

// Interceptor for logging
import { CallHandler, ExecutionContext, Ninjectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    return next
      .handle()
      .pipe(
        tap(() => console.log(`Request took ${Date.now() - now}ms`))
      )
  }
}
```

## Common Pitfalls

1. ❌ Not using dependency injection
2. ❌ Missing validation on DTOs
3. ❌ Poor error handling
4. ❌ No logging
5. ❌ Missing Swagger documentation
6. ❌ High cognitive complexity
7. ❌ Not using transactions for related operations
8. ❌ Hardcoded configuration values
9. ❌ Missing proper HTTP status codes
10. ❌ No input sanitization

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

