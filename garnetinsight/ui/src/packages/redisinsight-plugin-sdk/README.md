# Garnetinsight-plugin-sdk

The high-level API for communication between Garnet Insight
plugin and Garnet Insight application.

## Usage

```
npm install garnetinsight-plugin-sdk
or
yarn add garnetinsight-plugin-sdk
```

## Available methods

### setHeaderText(text)

Sets any custom text to the header of the command result

**Parameters:**

- `text` **{String}**

**Example:**

```js
import { setHeaderText } from 'garnetinsight-plugin-sdk';
setHeaderText('Matched: 10');
```

### executeRedisCommand(command)

Executes a Redis command _(currently, only read-only commands are supported)_.

**Parameters:**

- `command` **{String}** - command to execute

**Returns:**

- `Promise<[{ response, status }]>`

```js
/**
 * @async
 * @param {String} command
 * @returns {Promise.<[{ response, status }]>}
 * @throws {Error}
 */
```

**Example:**

```js
import { executeRedisCommand } from 'garnetinsight-plugin-sdk';
try {
  const result = await executeRedisCommand('GET foo');
  const [{ response, status }] = result;
  if (status === 'success') {
    // Do smth
  }
} catch (e) {
  console.error(e);
}
```

### getState()

Returns saved state for the command visualization.

Throw an error if the state has not been saved.

**Parameters:**

- `state` **{any}** - any data to save

**Returns:**

- `Promise<any>`

```js
/**
 * @async
 * @returns {Promise.<any>} state
 * @throws {Error}
 */
```

**Example:**

```js
import { getState } from 'garnetinsight-plugin-sdk';
try {
  const result = await getState();
} catch (e) {
  console.error(e);
}
```

### setState(state)

Save the state for the command visualization.

**Returns:**

- `Promise<any>`

```js
/**
 * @async
 * @param {any} state
 * @returns {Promise.<any>} state
 * @throws {Error}
 */
```

**Example:**

```js
import { setState } from 'garnetinsight-plugin-sdk';
try {
  await setState({ a: 1, b: 2 });
} catch (e) {
  console.error(e);
}
```

### formatRedisReply(response, command)

Util function to parse Redis response

Returns string with parsed cli-like response

**Returns:**

- `Promise<string>`

```js
/**
 * @async
 * @param {any} response
 * @param {String} command
 * @returns {Promise.<string>} data
 * @throws {Error}
 */
```

**Example:**

```js
import { formatRedisReply } from 'garnetinsight-plugin-sdk';

try {
  const parsedReply = await formatRedisReply(data[0].response, command);

  /*
    parsedReply:
    
    1) 1) "COUNT(a)"
    2) 1) 1) "0"
    3) 1) "Cached execution: 1"
       2) "Query internal execution time: 3.134125 milliseconds"
   */
} catch (e) {
  console.error(e);
}
```
