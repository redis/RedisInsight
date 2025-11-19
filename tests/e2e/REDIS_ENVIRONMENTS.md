# Redis Test Environments - Connection Guide

This document lists all available Redis environments for testing RedisInsight.

## 🚀 Quick Start

### 1. Start All Redis Services
```bash
cd tests/e2e
docker-compose -f rte.docker-compose.yml up -d
```

### 2. Start VPN (Required for Clusters and Sentinel)
```bash
docker-compose -f rte.networks.docker-compose.yml -f vpn.docker-compose.yml up -d
```

### 3. Connect to VPN
- **Profile**: `tests/e2e/rte/openvpn/test.ovpn`
- **Import** into your OpenVPN client and Connect
- **Verify**: `ping 172.31.100.221` should work

### 4. Ready to Test!
All Redis environments are now accessible. See below for connection details.

---

## 📊 Available Environments Summary

- **8 Standalone instances** (different versions and configurations) - No VPN needed
- **3 Cluster configurations** (plain, RediSearch, RedisGears) - VPN required
- **1 Sentinel setup** - VPN required
- **1 Redis Enterprise** - No VPN needed (but needs 12GB+ RAM)
- **1 SSH server** - For testing SSH tunneling

| Database Type | URL | User/Password | VPN Required | Notes |
|--------------|-----|----------|--------------|-------|
| OSS Standalone | localhost:8100 | None | No | Redis with modules (Search, Graph, TimeSeries, JSON, Bloom) |
| OSS Standalone v5 | localhost:8101 | None | No | Redis 5.0.14 |
| OSS Standalone v7 | localhost:8108 | None | No | Redis 7.4-rc2 |
| OSS Standalone v8 | localhost:8109 | None | No | Redis 8.0-M02 |
| OSS Standalone Empty | localhost:8105 | None | No | Empty database with all modules |
| OSS Standalone Big | localhost:8103 | None | No | Large dataset (~2.6GB) for performance testing |
| OSS Standalone TLS | localhost:8104 | None | No | TLS/SSL enabled |
| OSS Standalone RedisGears | localhost:8106 | None | No | RedisGears 2.0 module |
| OSS Cluster v7 | localhost:8200 or 172.31.100.211:6379 | None | Yes | 3 master nodes, cluster mode |
| OSS Cluster RediSearch | localhost:8221 or 172.31.100.221:6379 | None | Yes | 3 masters with RediSearch & JSON |
| OSS Cluster RedisGears 2.0 | 172.31.100.191:6379 | None | **Yes** | 6 nodes (3 masters + 3 replicas), VPN only |
| OSS Sentinel | localhost:28100 | password | Yes | Sentinel with 2 primary nodes |
| Redis Enterprise API | https://localhost:19443 | demo@redislabs.com / 123456 | No | Web UI access |
| Redis Enterprise DB | localhost:12000 | None | No | Requires 12GB+ RAM, may fail on low memory |
| SSH Server | localhost:2222 | u / pass | No | For SSH tunneling. Connect to 172.31.100.109:6379 (OSS Standalone) |


