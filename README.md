[![Release](https://img.shields.io/github/v/release/RedisInsight/RedisInsight.svg?sort=semver)](https://github.com/RedisInsight/RedisInsight/releases)

# <img src="https://github.com/RedisInsight/RedisInsight/blob/main/resources/icon.png" alt="logo" width="25"/> Redis Insight - Developer GUI for Redis, by Redis.

[![Forum](https://img.shields.io/badge/Forum-RedisInsight-red)](https://forum.redis.com/c/redisinsight/65)
[![Discord](https://img.shields.io/discord/697882427875393627?style=flat-square)](https://discord.gg/QUkjSsk)

Redis Insight is a visual tool that provides capabilities to design, develop, and optimize your Redis application.
Query, analyse and interact with your Redis data. [Download it here](https://redis.io/insight/#insight-form)!
.
![Redis Insight Browser screenshot](/.github/screenshots/Redis-Insight-Browser.png)

| Workbench | Analysis | Slow Log | CLI |
| - | - | - | - |
| ![Redis Insight Workbench screenshot](/.github/screenshots/Redis-Insight-Workbench.png) | ![Redis Insight Analysis screenshot](/.github/screenshots/Redis-Insight-Analysis.png) | ![Redis Insight SlowLog screenshot](/.github/screenshots/Redis-Insight-SlowLog.png) | ![Redis Insight CLI screenshot](/.github/screenshots/Redis-Insight-CLI.png) |

Built with love using [Electron](https://www.electronjs.org/), [Monaco Editor](https://microsoft.github.io/monaco-editor/) and NodeJS.

## Overview

Redis Insight is an intuitive and efficient GUI for Redis, allowing you to interact with your databases and manage your data—with built-in support for Redis modules.

### Redis Insight Highlights:

- Browse, filter, visualise your key-value Redis data structures and see key values in different formats (including JSON, Hex, ASCII, etc.)
- CRUD support for lists, hashes, strings, sets, sorted sets, and streams
- CRUD support for [JSON](https://redis.io/json/) data structure
- Interactive tutorials to learn easily, among other things, how to leverage the native JSON data structure supporting structured querying and full-text search, including vector similarity search for your AI use cases
- Contextualised recommendations to optimize performance and memory usage. The list of recommendations gets updated as you interact with your database
- Profiler - analyze every command sent to Redis in real-time
- SlowLog - analyze slow operations in Redis instances based on the [Slowlog](https://github.com/RedisInsight/RedisInsight/releases#:~:text=results%20of%20the-,Slowlog,-command%20to%20analyze) command
- Pub/Sub - support for [Redis pub/sub](https://redis.io/docs/latest/develop/interact/pubsub/), enabling subscription to channels and posting messages to channels
- Bulk actions - Delete the keys in bulk based on the filters set in Browser or Tree view
- Workbench - advanced command line interface with intelligent command auto-complete, complex data visualizations and support for the raw mode
- Command auto-complete support for [search and query](https://redis.io/search/) capability, [JSON](https://redis.io/json/) and [time series](https://redis.io/timeseries/) data structures
- Visualizations of your [search and query](https://redis.io/search/) indexes and results.
- Ability to build [your own data visualization plugins](https://github.com/RedisInsight/Packages)
- Officially supported for Redis OSS, [Redis Cloud](https://redis.io/cloud/). Works with Microsoft Azure Cache for Redis

Check out the [release notes](https://github.com/RedisInsight/RedisInsight/releases).

## Get started with Redis Insight

This repository includes the code for Redis Insight. Check out the [blogpost](https://redis.com/blog/introducing-redisinsight-2/) announcing it.

### Installable

Redis Insight is available as a free download [redis.io](https://redis.io/insight/#insight-form).
You can also find it on the Microsoft Store, Apple App Store, Snapcraft, Flathub, and as a [Docker image](https://hub.docker.com/r/redis/redisinsight).

Additionally, you can use [Redis for VS Code](https://github.com/RedisInsight/Redis-for-VS-Code), our official Visual Studio Code extension.

### Build

Alternatively you can also build from source. See our wiki for instructions.

- [How to build](https://github.com/RedisInsight/RedisInsight/wiki/How-to-build-and-contribute)

## How to debug

If you have any issues occurring in Redis Insight, you can follow the steps below to get more information about the errors and find their root cause.

- [How to debug](https://github.com/RedisInsight/RedisInsight/wiki/How-to-debug)

## Redis Insight API (only for Docker)

If you are running Redis Insight from [Docker](https://hub.docker.com/r/redis/redisinsight), you can access the API from `http://localhost:5540/api/docs`.

## Feedback

- Request a new [feature](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=feature_request.md&title=%5BFeature+Request%5D%3A)
- Upvote [popular feature requests](https://github.com/RedisInsight/RedisInsight/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+sort%3Areactions-%2B1-desc)
- File a [bug](https://github.com/RedisInsight/RedisInsight/issues/new?assignees=&labels=&template=bug_report.md&title=%5BBug%5D%3A)

## Redis Insight Plugins

With Redis Insight you can now also extend the core functionality by building your own data visualizations. See our wiki for more information.

- [Plugin Documentation](https://github.com/RedisInsight/RedisInsight/wiki/Plugin-Documentation)

## Contributing

If you would like to contribute to the code base or fix and issue, please consult the wiki.

- [How to build and contribute](https://github.com/RedisInsight/RedisInsight/wiki/How-to-build-and-contribute)

## API documentation

If you're using a Docker image of Redis Insight, open this URL to view the list of APIs:
http://localhost:5530/api/docs

## Telemetry

Redis Insight includes an opt-in telemetry system, that is leveraged to help improve the developer experience (DX) within the app. We value your privacy, so stay assured, that all the data collected is anonymised.

## License

Redis Insight is licensed under [SSPL](/LICENSE) license.
