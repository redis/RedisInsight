# Securing the Docker image

The Redis Insight Docker image has no built-in login or user management. Anyone who can reach the port can use Redis Insight, including the connections and passwords saved in it.

Decide who can reach it before you publish the port.

## Limit access to the port

Publish the port on the loopback interface to allow access from the same machine only:

```bash
docker run -d --name redisinsight -p 127.0.0.1:5540:5540 -v redisinsight:/data redis/redisinsight:latest
```

Publishing it without an address (`-p 5540:5540`) makes it reachable from every network the host is connected to.

Do not set `RI_APP_HOST=127.0.0.1` inside the container: Docker can no longer forward the published port to it.

## Add authentication

To give a team access, put Redis Insight behind a reverse proxy that handles authentication, and keep the port itself closed to the network.

- A sample setup: [RedisInsight-reverse-proxy](https://github.com/RedisInsight/RedisInsight-reverse-proxy)
- To serve Redis Insight under a subpath, set `RI_PROXY_PATH`.

## Cross-origin browser access

By default, the Docker image does not let web pages from other origins call its API. The Redis Insight UI is not affected, because it is served from the same origin as the API.

If you need a page on another origin to call the API, set the origin explicitly:

| Variable              | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `RI_CORS_ORIGIN`      | The origin allowed to call the API, for example `https://tools.example.com`. |
| `RI_CORS_CREDENTIALS` | Set to `true` to allow requests with credentials.                            |

Only set it to an origin you trust.
