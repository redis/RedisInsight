## Introduction

Redis can hold a range of different data types. Visualizing these in a format that’s convenient to you for validation and debugging is paramount. You can now easily extend the core functionality of Redis Insight independently by building your own custom visualization plugin. 


Data visualization provided by the plugin is rendered within the Workbench results area and is based on the executed command, ie. a certain Redis command can generate its own custom data visualization.


We have included the following [plugin package example](https://github.com/RedisInsight/RedisInsight/tree/main/redisinsight/ui/src/packages/clients-list) for your reference: running the CLIENT LIST command presents the output in a tabular format for easier reading. 


## How to run a plugin within Redis Insight


**Note**: While adding new plugins for Workbench, use files only from trusted 
authors to avoid automatic execution of malicious code.

1. Download the plugin package folder from a trusted source
2. Open the `plugins` folder located at the following path
   * For MacOs: `<usersHomeDir>/.redis-insight/plugins`
   * For Windows: `C:/Users/{Username}/.redis-insight/plugins`
   * For Linux: `<usersHomeDir>/.redis-insight/plugins`
3. Add the plugin package to the `plugins` folder
4. Navigate to Workbench within Redis Insight and execute the Redis command relevant for the plugin visualization
5. Select the visualization type for the displayed results (if this visualization has not been set by default)

If you have added or modified a plugin mid session, you might need to reload the entire Workbench window to see any changes.

## How to develop a Redis Insight plugin

### How it works

Plugin visualization within the Workbench is rendered using Iframe to encapsulate plugin scripts and styles, described in 
the main plugin script and the stylesheet (if it has been specified in the `package.json`). Iframe also includes basic styles.
A single plugin package may provide multiple visulizations. 

### Plugin structure

Each plugin package should consist of a uniquely named folder that is placed inside the default `plugins` folder. The following files should be included:

* **pluginName/package.json** *(required)* - Manifest of the plugin
* **pluginName/{anyName}.js** *(required)* - Core script of the plugin
* **pluginName/{anyName}.css** *(optional)* - File with styles for the plugin visualizations
* **pluginName/{anyFileOrFolder}** *(optional)* - Specify any other file or folder inside the plugin folder 
to use by the core module script. *For example*: pluginName/images/image.png.

`package.json` - should be located in the root folder of your plugin (all other files can be included in a subfolder).

#### `package.json` structure

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
      Required fields of a visualization:
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
      Optional fields of a visualization:
      <ul>
        <li><strong><i>default</i></strong> - set <strong>true</strong> to make this visualization the default for the matched commands</li>
        <li><strong><i>description</i></strong> - description of your visualization</li>
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
    "name": "Vijay Nirmal",
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
      "matchCommands": [
        "CLIENT LIST"
      ],
      "description": "Example of client list plugin",
      "default": true
    }
  ],
  "devDependencies": {},
  "dependencies": {}
}
```

### Core script of the plugin

This is the required script with defined visualization methods.
The core script contains the function and its **default export** (functions - for multiple visualizations), 
which is run after the relevant visualization is selected in the Workbench.

The following function receives props of the executed commands:
```typescript
interface Props {
  command: string; // executed command
  data: string; // result of the executed command
  status: 'success' | 'fail'; // response status of the executed command
}

const renderVisualization = (props: Props) => {
    // Do your magic
}

// This is a required action - export the main function for execution of the visualization
export default { renderVisualization }
```

Each plugin iframe has basic styles of Redis Insight application, including fonts and color schemes.

It is recommended to use the React & [Elastic UI library](https://elastic.github.io/eui/#/) for 
consistency with plugin visualisations and the entire application.


Check out the CLIENT LIST plugin reference example:


* [Client List Plugin README](https://github.com/RedisInsight/RedisInsight/blob/main/redisinsight/ui/src/packages/clients-list/README.md)
* [Client List Plugin dir](https://github.com/RedisInsight/RedisInsight/tree/main/redisinsight/ui/src/packages/clients-list)


#### Available parameters


Additional information provided to the plugin iframe is included in the `window.state` 
inside of the plugin script.

```javascript
const { config, modules } = window.state
const { baseUrl } = config

// modules - the list of modules of the current database
// baseUrl - url for your plugin folder - can be used to include your assets
```

### Plugin rendering
To render the plugin visualization, the iframe with basic html is generated which is 
then populated with relevant scripts and styles. To render the html data, use existing 
DOM Element `#app` or create your own DOM Elements.
Rendered iframe also includes `theme_DARK` or `theme_LIGHT` className on `body` to indicate the application theme used.

_Javascript Example:_
```javascript
const renderVisualization = (props) => {
    const { command, data } = props;
    document.getElementById('app')
      .innerHTML = `
        <h3>Executed command:<h3>
        <p>${command}</p>
        <h4>Result of the command</h4>
        <p>${data}</p>
      `
}

// This is a required action - export the main function for execution of the visualization
export default { renderVisualization }
```

_React Example:_
```javascript
import { render } from 'react-dom'
import App from './App'

const renderVisualization = (props) => {
  const { command, status, data = '' } = props
  render(
    <App command={command} response={data} status={status} />,
    document.getElementById('app')
  )
}

// This is a required action - export the main function for execution of the visualization
export default { renderVisualization }
```


## Plugin communication

Use the [redisinsight-plugin-sdk](https://www.npmjs.com/package/redisinsight-plugin-sdk), which is a third party library, 
to communicate with the main app.

Find the list and
description of methods called in the 
[README.md](../../redisinsight/ui/src/packages/redisinsight-plugin-sdk/README.md).