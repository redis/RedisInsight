# Testing Standards and Practices

## General Testing Principles

### Core Principles

- **Write tests for all new features** - No feature is complete without tests
- **Follow AAA pattern**: Arrange, Act, Assert
- **Use descriptive test names**: "should do X when Y"
- **CRITICAL**: Never use fixed time waits with magic numbers - tests must be deterministic
- **CRITICAL**: Use faker library (@faker-js/faker) for generating random test data

### Test Coverage Requirements

```javascript
// jest.config.cjs - Coverage thresholds
coverageThreshold: {
  global: {
    statements: 80,   // 80% minimum
    branches: 63,     // 63% minimum
    functions: 72,    // 72% minimum
    lines: 80,        // 80% minimum
  },
}
```

### Test Organization

```typescript
describe('FeatureService', () => {
  // Group related tests
  describe('findById', () => {
    it('should return entity when found', () => {});
    it('should throw NotFoundException when not found', () => {});
  });

  describe('create', () => {
    it('should create entity with valid data', () => {});
    it('should throw error with invalid data', () => {});
  });
});
```

## Frontend Testing (Jest + Testing Library)

### Component Test Pattern

**Important**: Create a shared `renderComponent` helper function for each component test file. This function should:

- Accept props overrides
- Provide default props and behavior
- Handle common setup (Redux Provider, Router, etc.)
- Be reusable across all test cases

```typescript
import React from 'react'
import { render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { faker } from '@faker-js/faker'
import { MyComponent } from './MyComponent'
import { MyComponentProps } from './MyComponent.types'
import { store } from 'uiSrc/slices/store'

describe('MyComponent', () => {
  // ✅ GOOD: Shared render helper with default props
  const defaultProps: MyComponentProps = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    onComplete: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<MyComponentProps>): RenderResult => {
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <Provider store={store}>
        <MyComponent {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render component with data', () => {
    // Arrange
    const name = faker.person.fullName()
    const email = faker.internet.email()

    // Act
    renderComponent({ name, email })

    // Assert
    expect(screen.getByText(name)).toBeInTheDocument()
    expect(screen.getByText(email)).toBeInTheDocument()
  })

  it('should call onComplete when button is clicked', async () => {
    // Arrange
    const mockOnComplete = jest.fn()
    renderComponent({ onComplete: mockOnComplete })

    // Act
    const button = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(button)

    // Assert - ✅ GOOD: Use waitFor for async behavior
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  it('should display error message on failure', async () => {
    // Arrange
    const errorMessage = faker.lorem.sentence()

    // Act
    renderComponent({ error: errorMessage })

    // Assert - ✅ GOOD: Use waitFor instead of fixed timeout
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should handle loading state', () => {
    // Act
    renderComponent({ loading: true })

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

### Complex Component Setup Example

For components requiring more complex setup (Router, theme, etc.):

```typescript
import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components/macro'
import { faker } from '@faker-js/faker'
import { UserProfile } from './UserProfile'
import { UserProfileProps } from './UserProfile.types'
import { store } from 'uiSrc/slices/store'
import { theme } from 'uiSrc/styles/theme'

describe('UserProfile', () => {
  const defaultProps: UserProfileProps = {
    userId: faker.string.uuid(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<UserProfileProps>): RenderResult => {
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <UserProfile {...props} />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render user profile', () => {
    renderComponent()
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
  })
})
```

### Testing with Redux Store

For components with Redux state, create a test store:

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { faker } from '@faker-js/faker'
import { userSlice } from 'uiSrc/slices/user'

describe('ConnectedComponent', () => {
  const createTestStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        user: userSlice.reducer,
      },
      preloadedState: initialState,
    })
  }

  const renderComponent = (propsOverride?: Partial<Props>, storeState = {}) => {
    const testStore = createTestStore(storeState)
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <Provider store={testStore}>
        <ConnectedComponent {...props} />
      </Provider>
    )
  }

  it('should display user from Redux store', () => {
    const userName = faker.person.fullName()

    renderComponent({}, {
      user: {
        data: { name: userName },
        loading: false,
      },
    })

    expect(screen.getByText(userName)).toBeInTheDocument()
  })
})
```

### Query Priorities (Testing Library)

```typescript
// ✅ PREFERRED: Accessible queries (as users would interact)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter name');
screen.getByText('Welcome');

// ✅ ACCEPTABLE: Semantic queries
screen.getByAltText('Profile picture');
screen.getByTitle('Close dialog');

// ⚠️ LAST RESORT: test IDs
screen.getByTestId('user-profile');

// ❌ AVOID: Implementation details
wrapper.find('.button-class');
wrapper.instance().method();
```

### Testing Async Behavior

```typescript
// ✅ GOOD: waitFor with proper queries
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ GOOD: waitForElementToBeRemoved
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

// ✅ GOOD: findBy queries (built-in waiting)
const element = await screen.findByText('Async content');

// ❌ BAD: Fixed timeouts (flaky tests)
await new Promise((resolve) => setTimeout(resolve, 1000));
expect(screen.getByText('Data')).toBeInTheDocument();
```

### Mocking API Calls (MSW)

```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { faker } from '@faker-js/faker'

// Setup mock server
const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        id: req.params.id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('should fetch and display user data', async () => {
  const userId = faker.string.uuid()

  render(<UserProfile userId={userId} />)

  await waitFor(() => {
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
```

### Testing Redux

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';
import { userSlice, fetchUser } from './userSlice';

describe('userSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { user: userSlice.reducer },
    });
  });

  it('should handle fetchUser.fulfilled', () => {
    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
    };

    store.dispatch(fetchUser.fulfilled(user, '', user.id));

    expect(store.getState().user.data).toEqual(user);
    expect(store.getState().user.loading).toBe(false);
  });
});
```

## Backend Testing (NestJS/Jest)

### Service Test Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const mockUser = {
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      mockRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = faker.string.uuid();
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      // Arrange
      const createDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };
      const mockUser = { id: faker.string.uuid(), ...createDto };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
```

### Controller Test Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user from service', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      mockService.findById.mockResolvedValue(mockUser);

      const result = await controller.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockService.findById).toHaveBeenCalledWith(userId);
    });
  });
});
```

### Integration Tests (E2E - API)

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return array of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users (POST)', () => {
    it('should create new user', () => {
      const createDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(createDto.name);
          expect(res.body.email).toBe(createDto.email);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '' }) // Missing required email
        .expect(400);
    });
  });
});
```

## E2E Testing (Playwright)

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('User Management', () => {
  test('should create and display new user', async ({ page }) => {
    // Arrange
    const userName = faker.person.fullName();
    const userEmail = faker.internet.email();

    // Act
    await page.goto('/users');
    await page.click('text=Add User');
    await page.fill('[name="name"]', userName);
    await page.fill('[name="email"]', userEmail);
    await page.click('text=Submit');

    // Assert - Use proper waits, not timeouts
    await expect(page.locator(`text=${userName}`)).toBeVisible();
    await expect(page.locator(`text=${userEmail}`)).toBeVisible();
  });

  test('should edit existing user', async ({ page }) => {
    const newName = faker.person.fullName();

    await page.goto('/users');
    await page.click('[data-test="edit-button"]:first-child');
    await page.fill('[name="name"]', newName);
    await page.click('text=Save');

    // ✅ GOOD: Wait for element
    await page.waitForSelector(`text=${newName}`);
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });
});
```

## Testing Best Practices

### Use Faker for Test Data

```typescript
// ✅ GOOD: Use faker for random data
const user = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 100 }),
  address: faker.location.streetAddress(),
};

// ❌ BAD: Hardcoded test data
const user = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
};
```

### No Fixed Timeouts

```typescript
// ❌ BAD: Fixed timeout (flaky)
await new Promise((resolve) => setTimeout(resolve, 1000));
expect(element).toBeInTheDocument();

// ❌ BAD: Magic number timeout
await page.waitForTimeout(2000);

// ✅ GOOD: Wait for specific condition
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// ✅ GOOD: Playwright built-in waiting
await page.waitForSelector('[data-test="result"]');
await expect(page.locator('[data-test="result"]')).toBeVisible();
```

### Mock External Dependencies

```typescript
// ✅ GOOD: Mock external services
jest.mock('uiSrc/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// ✅ GOOD: Use jest-when for complex scenarios
import { when } from 'jest-when';

when(mockService.findById)
  .calledWith('user-1')
  .mockResolvedValue({ id: 'user-1', name: 'User 1' })
  .calledWith('user-2')
  .mockResolvedValue({ id: 'user-2', name: 'User 2' });
```

### Test Edge Cases

```typescript
describe('calculateTotal', () => {
  it('should handle empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle single item', () => {
    expect(calculateTotal([10])).toBe(10);
  });

  it('should handle negative numbers', () => {
    expect(calculateTotal([10, -5])).toBe(5);
  });

  it('should handle large numbers', () => {
    expect(calculateTotal([Number.MAX_SAFE_INTEGER, 1])).toBeDefined();
  });

  it('should handle null/undefined gracefully', () => {
    expect(() => calculateTotal(null)).not.toThrow();
  });
});
```

## Common Testing Pitfalls

1. ❌ Using fixed timeouts instead of waitFor
2. ❌ Hardcoding test data instead of using faker
3. ❌ Testing implementation details instead of behavior
4. ❌ Not cleaning up mocks between tests
5. ❌ Missing edge case tests
6. ❌ Not testing error scenarios
7. ❌ Shallow testing without integration tests
8. ❌ No E2E tests for critical flows
9. ❌ Forgetting to assert in async tests
10. ❌ Not using proper queries (getByRole, etc.)
11. ❌ Calling `render` directly in tests instead of using shared `renderComponent` helper
12. ❌ Duplicating setup code across test cases

## Testing Checklist

- [ ] All new features have tests
- [ ] Tests use faker for data generation
- [ ] No fixed timeouts (use waitFor)
- [ ] Tests follow AAA pattern
- [ ] Descriptive test names
- [ ] Shared `renderComponent` helper used (no direct `render` calls)
- [ ] Default props defined for component tests
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mocks cleaned up between tests
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Coverage meets thresholds (80%+)
