# Plugin for the “Client List” command

The plugin has been created using React, TypeScript, and [Elastic UI](https://elastic.github.io/eui/#/).
[Parcel](https://parceljs.org/) is used to build the plugin.

## Running locally

The following commands will install dependencies and start the server to run the plugin locally:

```
npm install
npm start
```

These commands will install dependencies and start the server.

_Note_: Base styles are included to `index.html`
from [RedisInsight](https://github.com/RedisInsight/RedisInsight) repository.

_From Redis Insight Repo_:
This command will generate the `vendor` folder with styles and fonts of the core app. Add this folder
inside the folder for your plugin and include appropriate styles to the `index.html` file.

```
npm install
npm install --prefix redisinsight/api

npm run build:statics - for Linux or MacOs
npm run build:statics:win - for Windows
```

## Build plugin

The following commands will build plugins to be used in Redis Insight:

```
npm install
npm run build
```

[Add](https://github.com/RedisInsight/RedisInsight/blob/main/docs/plugins/installation.md) the package.json file and the
`dist` folder to the folder with your plugin, which should be located in the `plugins` folder.
