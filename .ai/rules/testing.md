---
alwaysApply: true
---

# Testing Standards and Practices

## Core Principles

- **Write tests for all new features**
- Follow **AAA pattern**: Arrange, Act, Assert
- Use **descriptive test names**: "should do X when Y"
- **CRITICAL**: Never use fixed time waits - tests must be deterministic
- **CRITICAL**: Use faker library (@faker-js/faker) for test data

## Test Organization

```typescript
describe('FeatureService', () => {
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

### Running Specific Tests

```bash
# Run a specific test file
node 'node_modules/.bin/jest' 'redisinsight/ui/src/path/to/Component.spec.tsx' -c 'jest.config.cjs'

# Run a specific test by name (use -t flag)
node 'node_modules/.bin/jest' 'redisinsight/ui/src/path/to/Component.spec.tsx' -c 'jest.config.cjs' -t 'test name pattern'

# Example:
node 'node_modules/.bin/jest' 'redisinsight/ui/src/slices/tests/browser/keys.spec.ts' -c 'jest.config.cjs' -t 'refreshKeyInfoAction'
```

### CRITICAL: Always Use Shared `renderComponent` Helper

**Create a `renderComponent` helper for each component test file**:

```typescript
import { faker } from '@faker-js/faker';

describe('MyComponent', () => {
  // Define default props with faker
  const defaultProps: MyComponentProps = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    onComplete: jest.fn(),
  };

  // Shared render helper
  const renderComponent = (propsOverride?: Partial<MyComponentProps>) => {
    const props = { ...defaultProps, ...propsOverride };

    return render(
      <Provider store={store}>
        <MyComponent {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    renderComponent();
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const mockOnComplete = jest.fn();
    renderComponent({ onComplete: mockOnComplete });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Benefits**:

- Centralized setup (providers, router, theme)
- Default props defined once
- Easy prop overrides per test
- No duplicate setup code

### Complex Component Setup

For components requiring Router, ThemeProvider, etc., include them in `renderComponent`:

```typescript
const renderComponent = (propsOverride?: Partial<Props>) => {
  const props = { ...defaultProps, ...propsOverride }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Component {...props} />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  )
}
```

### Testing with Redux

Create a test store with `configureStore` for Redux-connected components:

```typescript
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: { user: userSlice.reducer },
    preloadedState: initialState,
  });
};

const renderComponent = (propsOverride?: Partial<Props>, storeState = {}) => {
  const testStore = createTestStore(storeState);
  // render with testStore
};
```

### Query Priorities (Testing Library)

**Prefer accessible queries** (as users would interact):

```typescript
// ✅ PREFERRED
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter name');

// ⚠️ LAST RESORT
screen.getByTestId('user-profile');

// ❌ AVOID
wrapper.find('.button-class');
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
```

### Mocking API Calls (MSW)

Use Mock Service Worker for API mocking:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        id: req.params.id,
        name: faker.person.fullName(),
      }),
    );
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Backend Testing (NestJS/Jest)

### Service Test Pattern

```typescript
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

// Define factory for User entity
const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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

  it('should return user when found', async () => {
    const mockUser = userFactory.build();
    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findById(mockUser.id);

    expect(result).toEqual(mockUser);
  });
});
```

### Controller Test Pattern

```typescript
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should return user from service', async () => {
    const mockUser = userFactory.build();
    mockService.findById.mockResolvedValue(mockUser);

    const result = await controller.findById(mockUser.id);

    expect(result).toEqual(mockUser);
  });
});
```

### Integration Tests (E2E)

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

## E2E Testing (Playwright)

```typescript
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

const userDataFactory = Factory.define(() => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));

test.describe('User Management', () => {
  test('should create new user', async ({ page }) => {
    const userData = userDataFactory.build();

    await page.goto('/users');
    await page.click('text=Add User');
    await page.fill('[name="name"]', userData.name);
    await page.fill('[name="email"]', userData.email);
    await page.click('text=Submit');

    // ✅ Use proper waits
    await expect(page.locator(`text=${userData.name}`)).toBeVisible();
  });
});
```

## Best Practices

### Always Use Faker for Test Data

```typescript
// ✅ GOOD: Use faker
const user = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 100 }),
};

// ❌ BAD: Hardcoded data
const user = { id: '123', name: 'Test User' };
```

### Use Factories Instead of Static Mocks

**Use Fishery** for creating test data factories with sensible defaults and overrides:

```typescript
// ✅ GOOD: Fishery factory
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

const userFactory = Factory.define<User>(({ sequence }) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 100 }),
}));

// Usage - flexible and reusable
const user1 = userFactory.build();
const user2 = userFactory.build({ age: 25 });
const user3 = userFactory.build({ name: 'Specific Name' });
const users = userFactory.buildList(5); // Create multiple

// ❌ BAD: Static mock objects
const mockUser1 = {
  id: '123',
  name: 'User 1',
  email: 'user1@test.com',
  age: 30,
};
```

Benefits of Fishery factories:

- Easy to override specific properties per test
- Consistent default values across tests
- Single source of truth for mock structure
- Better maintainability when types change
- Built-in support for sequences and traits

### Never Use Fixed Timeouts

```typescript
// ❌ BAD: Fixed timeout
await new Promise((resolve) => setTimeout(resolve, 1000));
await page.waitForTimeout(2000);

// ✅ GOOD: Wait for condition
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

await page.waitForSelector('[data-test="result"]');
```

### Mock External Dependencies

```typescript
// ✅ GOOD: Mock services
jest.mock('uiSrc/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```

### Parameterized Tests with `it.each`

**Use `it.each` for multiple tests with the same body but different inputs:**

```typescript
// ✅ GOOD: Parameterized tests
it.each([
  { description: 'null', value: null },
  { description: 'undefined', value: undefined },
  { description: 'empty string', value: '' },
  { description: 'whitespace only', value: '   ' },
])('should return error when input is $description', async ({ value }) => {
  const result = await service.processInput(value);
  expect(result.status).toBe('error');
});
```

**Benefits:**

- DRY: Single test body shared across all cases
- Maintainability: Changes to test logic only need to be made once
- Readability: Test cases are clearly defined in a table
- Easier to extend: Adding new test cases is just adding a new row

### Test Edge Cases

Always test:

- Empty arrays/objects
- Null/undefined values
- Error scenarios
- Boundary conditions
- Loading states

## Testing Checklist

- [ ] All new features have tests
- [ ] Tests use faker for data generation
- [ ] No fixed timeouts (use waitFor)
- [ ] Tests follow AAA pattern
- [ ] Descriptive test names
- [ ] Shared `renderComponent` helper used
- [ ] Default props defined
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mocks cleaned up between tests
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Coverage meets thresholds (80%+)
