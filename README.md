[![Release](https://img.shields.io/github/v/release/Garnetinsight/Garnetinsight.svg?sort=semver)](https://github.com/Garnetinsight/Garnetinsight/releases)

# <img src="https://github.com/Garnetinsight/Garnetinsight/blob/main/resources/icon.png" alt="logo" width="25"/> Garnet Insight - Developer GUI for Garnet, by Microsoft.

[![Forum](https://img.shields.io/badge/Forum-Garnetinsight-red)](https://forum.redis.com/c/garnetinsight/65)
[![Discord](https://img.shields.io/discord/697882427875393627?style=flat-square)](https://discord.gg/QUkjSsk)

Garnet Insight is a visual tool that provides capabilities to design, develop, and optimize your Garnet application.
Query, analyse and interact with your Garnet data. [Download it here](https://aka.ms/garnet-portal)!

![Garnet Insight Browser screenshot](/.github/garnetinsight_browser.png)

Built with love using [Electron](https://www.electronjs.org/), [Monaco Editor](https://microsoft.github.io/monaco-editor/) and NodeJS.

## Overview

Garnet Insight is an intuitive and efficient GUI for Garnet, allowing you to interact with your databases and manage your data—with built-in support for Garnet modules.

### Garnet Insight Highlights:

- Browse, filter, visualise your key-value Redis data structures and see key values in different formats (including JSON, Hex, ASCII, etc.)
- CRUD support for lists, hashes, strings, sets, sorted sets, and streams
- CRUD support for [JSON](https://redis.io/json/) data structure
- Interactive tutorials to learn easily, among other things, how to leverage the native JSON data structure supporting structured querying and full-text search, including vector similarity search for your AI use cases
- Contextualised recommendations to optimize performance and memory usage. The list of recommendations gets updated as you interact with your database
- Profiler - analyze every command sent to Redis in real-time
- SlowLog - analyze slow operations in Redis instances based on the [Slowlog](https://github.com/Garnetinsight/Garnetinsight/releases#:~:text=results%20of%20the-,Slowlog,-command%20to%20analyze) command
- Pub/Sub - support for [Redis pub/sub](https://redis.io/docs/latest/develop/interact/pubsub/), enabling subscription to channels and posting messages to channels
- Bulk actions - Delete the keys in bulk based on the filters set in Browser or Tree view
- Workbench - advanced command line interface with intelligent command auto-complete, complex data visualizations and support for the raw mode
- Command auto-complete support for [search and query](https://redis.io/search/) capability, [JSON](https://redis.io/json/) and [time series](https://redis.io/timeseries/) data structures
- Visualizations of your [search and query](https://redis.io/search/) indexes and results.
- Ability to build [your own data visualization plugins](https://github.com/Garnetinsight/Packages)
- Officially supported for Garnet, [Azure Cosmos DB Garnet Cache](https://aka.ms/garnet-portal). Works with Microsoft Azure Cache for Redis

Check out the [release notes](https://github.com/Garnetinsight/Garnetinsight/releases).

## Get started with Garnet Insight

This repository includes the code for Garnet Insight. Check out the [blogpost](https://redis.com/blog/introducing-garnetinsight-2/) announcing it.

### Installable

Garnet Insight is available as a free download [aka.ms/garnet-portal](https://aka.ms/garnet-portal).
You can also find it on the Microsoft Store, Apple App Store, Snapcraft, Flathub, and as a [Docker image](https://hub.docker.com/r/redis/garnetinsight).

Additionally, you can use [Redis for VS Code](https://github.com/Garnetinsight/Redis-for-VS-Code), our official Visual Studio Code extension.

### Build

Alternatively you can also build from source. See our wiki for instructions.

- [How to build](https://github.com/Garnetinsight/Garnetinsight/wiki/How-to-build-and-contribute)

## How to debug

If you have any issues occurring in Garnet Insight, you can follow the steps below to get more information about the errors and find their root cause.

- [How to debug](https://github.com/Garnetinsight/Garnetinsight/wiki/How-to-debug)

## Garnet Insight API (only for Docker)

If you are running Garnet Insight from [Docker](https://hub.docker.com/r/redis/garnetinsight), you can access the API from `http://localhost:5540/api/docs`.

## Feedback

- Request a new [feature](https://github.com/Garnetinsight/Garnetinsight/issues/new?assignees=&labels=&template=feature_request.md&title=%5BFeature+Request%5D%3A)
- Upvote [popular feature requests](https://github.com/Garnetinsight/Garnetinsight/issues?q=is%3Aopen+is%3Aissue+label%3Afeature+sort%3Areactions-%2B1-desc)
- File a [bug](https://github.com/Garnetinsight/Garnetinsight/issues/new?assignees=&labels=&template=bug_report.md&title=%5BBug%5D%3A)

## Garnet Insight Plugins

With Garnet Insight you can now also extend the core functionality by building your own data visualizations. See our wiki for more information.

- [Plugin Documentation](https://github.com/Garnetinsight/Garnetinsight/wiki/Plugin-Documentation)

## Contributing

If you would like to contribute to the code base or fix and issue, please consult the wiki.

- [How to build and contribute](https://github.com/Garnetinsight/Garnetinsight/wiki/How-to-build-and-contribute)

## API documentation

If you're using a Docker image of Garnet Insight, open this URL to view the list of APIs:
http://localhost:5530/api/docs

## Telemetry

Garnet Insight includes an opt-in telemetry system, that is leveraged to help improve the developer experience (DX) within the app. We value your privacy, so stay assured, that all the data collected is anonymised.

## License

Garnet Insight is licensed under [SSPL](/LICENSE) license.
