# Running UI Tests

## Custom Test Runner

RedisInsight has a custom test runner script for running frontend tests with additional options.

## Usage

### Run Specific Test File

```bash
cd ~/Projects/RedisInsight
./vendor/scripts/run_tests.sh -f <path_to_file_from_root_of_repository>
```

Example:

```bash
./vendor/scripts/run_tests.sh -f redisinsight/ui/src/components/UserProfile/UserProfile.spec.tsx
```

### Run All Tests

```bash
cd ~/Projects/RedisInsight
./vendor/scripts/run_tests.sh -w 4
```

## Options

The test runner (`run_tests.sh`) provides several options:

- `-d, --directory DIR`: Working directory (default: current directory)
- `-n, --iterations NUM`: Number of test iterations to run (default: 4)
- `-c, --coverage`: Enable coverage reporting
- `-w, --workers NUM`: Number of workers for Jest (default: 1)
- `-f, --file PATH`: Path to specific test file to run
- `--ui`: Run UI tests (default)
- `--api`: Run API tests

## Environment Issues

If you encounter environment issues, source your shell configuration first:

```bash
source ~/.zshrc
cd ~/Projects/RedisInsight
./vendor/scripts/run_tests.sh -f <path>
```

## Standard Test Commands

For standard test running (without the custom script):

```bash
# Run all UI tests
yarn test

# Run specific test
yarn test -- --testNamePattern="test name"

# Run with coverage
yarn test:cov

# Run in watch mode
yarn test:watch
```

## Running API Tests

```bash
# Run all API tests
yarn test:api

# Run API integration tests
yarn test:api:integration
```

## Test File Location

- Test files are co-located with source files
- Use `.spec.ts` or `.spec.tsx` extension
- Example: `Component.tsx` → `Component.spec.tsx`

## Notes

- The custom runner path (`./vendor/scripts/run_tests.sh`) may be in `.gitignore`
- The `-w 4` flag runs tests with 4 workers for faster execution
- Coverage reports are generated in `/report/coverage/`
- The custom runner supports both UI and API tests

## Common Issues

### Path Not Found

If the test runner script is not found:

```bash
# Check if the file exists
ls -la ./vendor/scripts/run_tests.sh

# Make sure you're in the project root
pwd
```

### Environment Variables

Some tests may require specific environment variables:

```bash
export NODE_ENV=test
export RI_APP_TYPE=web
```

### Jest Cache Issues

If tests are failing due to cache:

```bash
yarn test --clearCache
```

## Examples

### Run Single Component Test

```bash
./vendor/scripts/run_tests.sh -f redisinsight/ui/src/components/Header/Header.spec.tsx
```

### Run Tests with Coverage

```bash
./vendor/scripts/run_tests.sh -f redisinsight/ui/src/slices/user/user.spec.ts -c
```

### Run Tests Multiple Times

```bash
./vendor/scripts/run_tests.sh -f redisinsight/ui/src/utils/validation.spec.ts -n 10
```

### Run All Tests with Multiple Workers

```bash
./vendor/scripts/run_tests.sh -w 4 -c
```

## Integration with AI Assistants

When asked to "run the tests" or "run UI tests":

1. Use the custom test runner if available
2. Provide the full path from repository root
3. Use appropriate worker count for all tests (`-w 4`)
4. Remember to `cd` to project directory first

## Quick Reference

| Command                                   | Description                  |
| ----------------------------------------- | ---------------------------- |
| `./vendor/scripts/run_tests.sh -f <path>` | Run specific test file       |
| `./vendor/scripts/run_tests.sh -w 4`      | Run all tests with 4 workers |
| `./vendor/scripts/run_tests.sh -c`        | Run with coverage            |
| `./vendor/scripts/run_tests.sh -n 10`     | Run 10 iterations            |
| `yarn test`                               | Standard Jest runner         |
| `yarn test:cov`                           | Standard with coverage       |
