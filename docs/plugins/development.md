# Plugin development

This document describes the guides to develop your own plugin for the Garnet Insight Workbench.

## How it works

Plugin visualization in the Workbench is rendered using Iframe to encapsulate plugin scripts and styles, described in
the main plugin script and the stylesheet (if it has been specified in the `package.json`),
iframe includes basic styles as well.

## Plugin structure

Each plugin should have a unique name with all its files [loaded](installation.md) to
a separate folder inside the default `plugins` folder.

> Default plugins are located inside the application.

### Files

`package.json` should be located in the root folder of your plugins, all other files can be included into a subfolder.

- **pluginName/package.json** _(required)_ - Manifest of the plugin
- **pluginName/{anyName}.js** _(required)_ - Core script of the plugin
- **pluginName/{anyName}.css** _(optional)_ - File with styles for the plugin visualizations
- **pluginName/{anyFileOrFolder}** _(optional)_ - Specify any other file or folder inside the plugin folder
  to use by the core module script. _For example_: pluginName/images/image.png.

## `package.json` structure

This is the required manifest to use the plugin. `package.json` file should include
the following **required** fields:

<table>
  <tr>
    <td><i>name</i></td>
    <td>Plugin name. It is recommended to use the folder name as the plugin name in the package.json.</td>
  </tr>
  <tr>
    <td><i>main</i></td>
    <td>Relative path to the core script of the plugin. <i>Example: </i> "./dist/index.js"</td>
  </tr>
  <tr>
    <td><i>visualizations</i></td>
    <td>
      Array of visualizations (objects) to visualize the results in the Workbench.
      <br><br>
      Required fields in visualizations:
      <ul>
        <li><strong><i>id</i></strong> - visualization id</li>
        <li><strong><i>name</i></strong> - visualization name to display in the Workbench</li>
        <li><strong><i>activationMethod</i></strong> - name of the exported function to call when 
this visualization is selected in the Workbench</li>
        <li>
          <strong><i>matchCommands</i></strong> - array of commands to use the visualization for. Supports regex string. 
          <i>Example: </i> ["CLIENT LIST", "FT.*"]
        </li>
      </ul>
    </td>
  </tr>
</table>

You can specify the path to a css file in the `styles` field. If specified,
this file will be included inside the iframe plugin.

Simple example of the `package.json` file with required and optional fields:

```json
{
  "author": {
    "name": "Redis Ltd.",
    "email": "support@redis.com",
    "url": "https://redis.com/redis-enterprise/redis-insight"
  },
  "description": "Show client list as table",
  "styles": "./dist/styles.css",
  "main": "./dist/index.js",
  "name": "client-list",
  "version": "0.0.1",
  "scripts": {},
  "visualizations": [
    {
      "id": "clients-list",
      "name": "Table",
      "activationMethod": "renderClientsList",
      "matchCommands": ["CLIENT LIST"],
      "description": "Example of client list plugin",
      "default": true
    }
  ],
  "devDependencies": {},
  "dependencies": {}
}
```

## Core script of the plugin

This is the required script with defined visualization methods.
The core script contains function and its export (functions - for multiple visualizations),
which is run after the relevant visualization is selected in the Workbench.

The following function receives props of the executed commands:

```typescript
interface Props {
  command: string; // executed command
  data: Result[]; // array of results (one item for Standalone)
}

interface Result {
  response: any; // response of the executed command
  status: 'success' | 'fail'; // response status of the executed command
}

const renderVisualization = (props: Props) => {
  // Do your magic
};

export default { renderVisualization };
```

Each plugin iframe has basic styles of Garnet Insight application, including fonts and color schemes.

It is recommended to use the React & [Elastic UI library](https://elastic.github.io/eui/#/) for
consistency with plugin visualisations and the entire application.

Find the example of the plugin here.

- [Client List Plugin README](https://github.com/Garnetinsight/Packages/blob/main/clients-list-example/README.md)
- [Client List Plugin dir](https://github.com/Garnetinsight/Packages/blob/main/clients-list-example/)

### Available parameters

Additional information provided to the plugin iframe is included in the `window.state`
inside of the plugin script.

```javascript
const { config, modules } = window.state;
const { baseUrl, appVersion } = config;

// modules - the list of modules of the current database
// baseUrl - url for your plugin folder - can be used to include your assets
// appVersion - version of the Garnet Insight application
```

### Plugin rendering

To render the plugin visualization, the iframe with basic html is generated which is
then populated with relevant scripts and styles. To render the html data, use existing
DOM Element `#app` or create your own DOM Elements.
Rendered iframe also includes `theme_DARK` or `theme_LIGHT` className on `body` to indicate the application theme used.

_Javascript Example:_

```javascript
const renderVisualization = (props) => {
  const { command, data = [] } = props;
  const [{ result, status }] = data;
  document.getElementById('app').innerHTML = `
        <h3>Executed command:<h3>
        <p>${command}</p>
        <h4>Result of the command</h4>
        <p>${result}</p>
        <h4>Status of the command</h4>
        <p>${status}</p>
      `;
};

export default { renderVisualization };
```

_React Example:_

```javascript
import { render } from 'react-dom';
import App from './App';

const renderVisualization = (props) => {
  const { command, data = [] } = props;
  const [{ result, status }] = data;
  render(
    <App command={command} response={result} status={status} />,
    document.getElementById('app'),
  );
};

// This is a required action - export the main function for execution of the visualization
export default { renderVisualization };
```

## Plugin communication

Use the [garnetinsight-plugin-sdk](https://www.npmjs.com/package/garnetinsight-plugin-sdk), which is a third party library,
to communicate with the main app.

Find the list and
description of methods called in the
[README.md](../../garnetinsight/ui/src/packages/garnetinsight-plugin-sdk/README.md).
