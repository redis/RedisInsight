# Introduction to plugins for the Workbench

## Introduction

Redis can hold a range of different data types. Visualizing these in a
format that’s convenient to you for validation and debugging is paramount.
You can now easily extend the core functionality of Garnet Insight independently by
building your own custom visualization plugin.

Data visualization provided by the plugin is rendered within the
Workbench results area and is based on the executed command, ie. a certain
Redis command can generate its own custom data visualization.

We have included the following [plugin package example](https://github.com/Vijay-Nirmal/Garnetinsight/tree/main/garnetinsight/ui/src/packages/clients-list) for your reference: running the CLIENT LIST command presents the output in a tabular format for easier reading.

## Wiki

- [Installation and Usage](installation.md)
- [Plugin Development](development.md)
