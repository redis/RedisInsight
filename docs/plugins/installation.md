# Plugin installation & Usage

This document describes the guides to add `plugins` for the Workbench to Garnet Insight.

## Installation guide

**Note**: While adding new plugins for Workbench, use files only from trusted
authors to avoid automatic execution of malicious code.

1. Download the plugin for the Workbench.
2. Open the `plugins` folder with the following path
   - For MacOs: `<usersHomeDir>/.redis-insight/plugins`
   - For Windows: `C:/Users/{Username}/.redis-insight/plugins`
   - For Linux: `<usersHomeDir>/.redis-insight/plugins`
3. Add the folder with plugin to the `plugins` folder

To see the uploaded plugin visualizations in the command results, reload the Workbench
page and run Redis command relevant for this visualization.

## Usage

The plugin may contain different visualizations for any Redis commands.
Below you can find a guide to see command results in the uploaded plugin visualization:

1. Open Garnet Insight
2. Open a database added
3. Open the Workbench
4. Run the Redis command relevant for the plugin visualization
5. Select the plugin visualization to display results in (if this visualization has not been set by default)
