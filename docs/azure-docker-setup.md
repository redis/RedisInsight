# Azure Authentication in Docker

This guide covers using Azure Entra ID authentication with RedisInsight when running in Docker.

> **Prerequisites:** Your Azure tenant must have admin consent granted for RedisInsight. See [Azure Setup Guide](azure-setup.md) for initial setup.

## Important: Localhost Access Required

Azure Entra ID authentication in RedisInsight uses a **public client application** which only supports `localhost` redirect URIs. This means:

- ✅ Access via `http://localhost:PORT` - **works**
- ❌ Access via `http://127.0.0.1:PORT` - does not work
- ❌ Access via `http://your-server-ip:PORT` - does not work
- ❌ Access via custom domain - does not work

If you need to access RedisInsight from a remote machine, use SSH port forwarding:

```bash
ssh -L 5540:localhost:5540 user@remote-server
# Then access http://localhost:5540 on your local machine
```

## Supported Ports

Azure Entra ID authentication is supported on the following localhost ports:

| Port | URL                     | Use Case                  |
| ---- | ----------------------- | ------------------------- |
| 5540 | `http://localhost:5540` | Default RedisInsight port |
| 8000 | `http://localhost:8000` | Alternative port          |
| 8001 | `http://localhost:8001` | Alternative port          |
| 8002 | `http://localhost:8002` | Alternative port          |
| 8003 | `http://localhost:8003` | Alternative port          |
| 8004 | `http://localhost:8004` | Alternative port          |
| 8005 | `http://localhost:8005` | Alternative port          |

When using a non-default port, set `RI_EXTERNAL_URL` to match:

```bash
docker run -p 8000:5540 -e RI_EXTERNAL_URL=http://localhost:8000 redis/redisinsight:latest
```

> **Note:** Azure Entra ID authentication requires one of the supported localhost ports. Custom domains are not currently supported.

## Quick Start

### Standard Docker (Port 5540)

If you run RedisInsight on the default port, Azure authentication works out of the box:

```bash
docker run -d -p 5540:5540 redis/redisinsight:latest
```

Access at `http://localhost:5540` and use "Sign in with Microsoft" to authenticate.

### Custom Port Mapping

When mapping to a different external port, set `RI_EXTERNAL_URL` so OAuth callbacks work correctly:

```bash
docker run -d \
  -p 8000:5540 \
  -e RI_EXTERNAL_URL=http://localhost:8000 \
  redis/redisinsight:latest
```

Access at `http://localhost:8000`.

### Docker Compose

```yaml
version: '3'
services:
  redisinsight:
    image: redis/redisinsight:latest
    ports:
      - '8000:5540'
    environment:
      - RI_EXTERNAL_URL=http://localhost:8000
    volumes:
      - redisinsight-data:/data

volumes:
  redisinsight-data:
```

## Reverse Proxy Setup

When running behind a reverse proxy, RedisInsight will work normally for general usage. However, **Azure Entra ID authentication requires accessing RedisInsight via one of the [supported localhost ports](#supported-ports)**.

### Nginx Example

```nginx
server {
    listen 443 ssl;
    server_name redisinsight.example.com;

    location / {
        proxy_pass http://localhost:5540;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Note:** For Azure Entra ID authentication, access RedisInsight directly via `http://localhost:5540` instead of the reverse proxy URL.

## Environment Variables

| Variable          | Description                                                      | Default                        |
| ----------------- | ---------------------------------------------------------------- | ------------------------------ |
| `RI_EXTERNAL_URL` | External URL for OAuth callbacks (e.g., `http://localhost:8000`) | None (uses `localhost:{port}`) |
| `RI_APP_PORT`     | Internal port the application listens on                         | `5540`                         |
| `RI_APP_HOST`     | Host address to bind to                                          | `0.0.0.0`                      |

## Kubernetes / Helm

When deploying to Kubernetes, use one of the [supported ports](#supported-ports) and set `RI_EXTERNAL_URL`:

```yaml
env:
  - name: RI_EXTERNAL_URL
    value: 'http://localhost:8000'
```
