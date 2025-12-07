If you wish to build from source or contribute follow the steps below. 
## Prerequisites

Make sure you have installed the following packages:
* [Node](https://nodejs.org/en/download/) >=`22`
* [yarn](https://www.npmjs.com/package/yarn) >=`1.21.3`

## Directory Structure
The cloned repository has the following directory structure: 
- `redisinsight/ui` - Contains the frontend code
- `redisinsight/api` - Contains the backend code
- `docs` - Contains the documentation
- `scripts` - Build scripts and other build-related files
- `configs` - Webpack configuration files and other build-related files
- `tests` - Contains e2e tests
## Installation
Before development or building, install the following required dependencies
```bash
yarn install && yarn --cwd redisinsight/api/
```
## Build
### Packaging the desktop app
#### Building statics for the enablement area and default plugins
Run `yarn build:statics` or `yarn build:statics:win` for Windows
After you have installed all dependencies you can package the app.
Run `yarn package:prod` to package app for the local platform:
#### Production
```bash
yarn package:prod
```
The packaged installer will become available in the folder _./release_.
## Development
### Developing using web
#### Running the RedisInsight backend part
Run `yarn --cwd redisinsight/api/ start:dev` to start a local API at `localhost:5540`.
#### Development Backend
```bash
yarn --cwd redisinsight/api/ start:dev
```
While the API is running, open your browser and navigate to http://localhost:5540/api/docs. You should see the Swagger UI.
#### Running frontend part of the app
Run `yarn dev:ui` to start a local server for UI.
#### Development Frontend
```bash
yarn dev:ui
```
Web interface will be available at http://localhost:8080.
Now servers will watch for changes and automatically build for you.
## Running frontend tests
#### Run UI unit tests 
```bash
yarn test
```
## Running backend tests
### Run backend unit tests
#### Plain tests
```bash
yarn --cwd redisinsight/api test
```
  
#### Tests with coverage
```bash
yarn --cwd redisinsight/api test:cov
```
### Run backend integration tests (using local server)
#### Plain tests
```bash
yarn --cwd redisinsight/api test:api
```
#### Tests with coverage
```bash  
yarn --cwd redisinsight/api test:api:cov
```
> **_NOTE_**: Using `yarn test:api*` scripts you should have redis server up and running.  
By default tests will look on `localhost:6379` without any auth.  
To customize tests configs, you should run test with proper environment variables.
Example:
If you have redis server running on a different host or port `somehost:7777` with default user pass `somepass`
You should run test commands with such environment variables
#### Plain tests
```bash
TEST_REDIS_HOST=somehost \ 
TEST_REDIS_PORT=7777 \
TEST_REDIS_PASSWORD=somepass \
yarn --cwd redisinsight/api test:api
```
You can find all possible environment variable available in the [constants.ts](redisinsight/api/test/helpers/constants.ts) file
### Run backend integration tests (using docker)
Please check [this documentation](https://github.com/RedisInsight/RedisInsight/blob/main/redisinsight/api/test/README.md) as well.
Here you should not care about tests and local redis database configuration
We will spin up server inside docker container and run tests over it
#### run this command
```bash
./redisinsight/api/test/test-runs/start-test-run.sh -r oss-st-6
```
- -r - is the Redis Test Environment name
We are supporting several test environments to run tests on various Redis databases:
- **oss-st-5**            - _OSS Standalone v5_
- **oss-st-5-pass**       - _OSS Standalone v5 with admin pass required_
- **oss-st-6**            - _OSS Standalone v6 and all modules_
- **oss-st-6-tls**        - _OSS Standalone v6 with TLS enabled_
- **oss-st-6-tls-auth**   - _OSS Standalone v6 with TLS auth required_
- **oss-clu**             - _OSS Cluster_
- **oss-clu-tls**         - _OSS Cluster with TLS enabled_
- **oss-sent**            - _OSS Sentinel_
- **re-st**               - _Redis Enterprise with Standalone inside_
- **re-clu**              - _Redis Enterprise with Cluster inside_
## Running E2E tests
Install E2E tests deps
```bash
yarn --cwd tests/e2e 
```
Run E2E tests
```bash
yarn --cwd tests/e2e test:chrome
```