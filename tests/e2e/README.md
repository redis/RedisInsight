# Garnet Insight Testcafe e2e tests

## 📚 Redis Test Environments

For a complete guide to all available Redis environments (standalone, clusters, sentinel, etc.), see **[REDIS_ENVIRONMENTS.md](./REDIS_ENVIRONMENTS.md)**

This includes:
- Connection details for 15+ Redis environments
- VPN setup for cluster access
- SSH tunneling configuration

---

### Before run tests run next commands

## start application:

```bash
yarn start:app
```

## run docker with last redis version

```bash
docker run --name redis-last-version -p 7777:6379 -d redislabs/redismod
```

### Run tests locally from the tests/e2e folder

- to run tests in Chrome browser run

```bash
yarn test:chrome
```

### Local test development

- There is no need to run whole test suite when you are developing only one (2, 3 :) ) test.
  To mark which tests should be run use `test.only(...)` syntax.

```javascript
test.only
    ...
})
```

- You can use `test.skip(...)` syntax to skip only one test.

```javascript
test.skip
    ...
})
```
