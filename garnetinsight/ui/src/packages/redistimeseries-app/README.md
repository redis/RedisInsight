# RedisTimeseries Plugin for Garnet Insight

The example has been created using React, TypeScript, and [Elastic UI](https://elastic.github.io/eui/#/).
[Parcel](https://parceljs.org/) is used to build the plugin.

## Running locally

The following commands will install dependencies and start the server to run the plugin locally:

```
yarn
yarn start
```

These commands will install dependencies and start the server.

_Note_: Base styles are included to `index.html` from the repository.

This command will generate the `vendor` folder with styles and fonts of the core app. Add this folder
inside the folder for your plugin and include appropriate styles to the `index.html` file.

```
yarn build:statics - for Linux or MacOs
yarn build:statics:win - for Windows
```

## Build plugin

The following commands will build plugins to be used in Garnet Insight:

```
yarn
yarn build
```

[Add](../../../../../docs/plugins/installation.md) the package.json file and the
`dist` folder to the folder with your plugin, which should be located in the `plugins` folder.
