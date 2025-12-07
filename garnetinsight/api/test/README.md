# Integration Tests

## How to Run

### Prerequisites

- **First Time Running Tests?**  
  If you're running the tests for the first time, please review the [Short Explanation and High-Level Overview](#short-explanation-and-high-level-overview).

- **Running a Subset of Tests**  
  You can run a specific subset of tests by modifying the `spec` glob in `/garnetinsight/api/test/api/.mocharc.yml`. This allows you to execute only the tests you need.

### Steps to Run Tests

1. **Run the Desired Environment**  
   It's recommended to use Docker for this, as it provides better control over versioning and switching between environments.

1. **Execute the Tests**  
   From the root directory of the repository, run the following command:

   ```bash
   yarn test:api:integration
   ```

#### Example

Let’s walk through an example where you need to run tests related to `string`.

1. **Modify the Test Subset**  
   Update `/garnetinsight/api/test/api/.mocharc.yml` to include only the `string` tests:

   ```yaml
   spec:
     - 'test/**/string/**/*.test.ts'
   ```

1. **Run the Environment in Docker**  
   For this example, let’s assume you need to run the tests against the `OSS-ST-6` environment. To do this:

   - Navigate to the environment directory:

     ```bash
     cd /garnetinsight/api/test/test-runs/oss-st-6
     ```

   - Start Docker:
     ```bash
     docker-compose up
     ```

1. **Run the Tests**  
   Finally, execute the tests from the root directory:

   ```bash
   yarn test:api:integration
   ```

---

## Short Explanation and High-Level Overview

The integration tests follow a basic structure:

- **Redis Environment**: Tests are executed against various Redis environments such as Redis Community Edition (Redis OSS), Redis Cluster, Redis Stack, etc.
- **Test Suites**: A collection of test scenarios are designed to evaluate different Redis features.

> **Note:** Keep in mind that specific Redis environments might require additional test suites. For example, Redis Stack includes `RediSearch`, which is not available in Redis OSS, meaning tests designed for `RediSearch` will fail if executed in a Redis OSS environment.

---

### Project Structure

#### Tests

The `/garnetinsight/api/test/api` directory contains all the test scenarios for the integration tests.

#### Environments

The `/garnetinsight/api/test/test-runs` directory houses the Redis Test Environments (RTEs). Some of these environments have more complex setups, such as TLS with authentication, and thus include all necessary components (e.g., keys, certificates).

> **Note:** You may encounter some code related to GitHub Actions workflows, as these tests are also automatically run through CI/CD.
