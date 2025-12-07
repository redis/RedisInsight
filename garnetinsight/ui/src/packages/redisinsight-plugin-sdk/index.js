import { sendMessageToMain } from './helpers';
import { POST_MESSAGE_EVENTS } from './events';

const { config, callbacks = { counter: 0 } } = window.state || {};
const { iframeId } = config || {};

/**
 * Set text to the header result
 *
 * @param {string} text
 */
export const setHeaderText = (text = '') => {
  sendMessageToMain({
    event: POST_MESSAGE_EVENTS.setHeaderText,
    iframeId,
    text,
  });
};

/**
 * Execute Read-only Redis Command
 *
 * @async
 * @param {String} command
 * @returns {Promise.<[{ response, status }]>}
 * @throws {Error}
 */
export const executeRedisCommand = (command = '') =>
  new Promise((resolve, reject) => {
    callbacks[callbacks.counter] = { resolve, reject };
    sendMessageToMain({
      event: POST_MESSAGE_EVENTS.executeRedisCommand,
      iframeId,
      command,
      requestId: callbacks.counter++,
    });
  });

/**
 * Returns the current state
 *
 * @async
 * @returns {Promise.<any>} state
 * @throws {Error}
 */
export const getState = () =>
  new Promise((resolve, reject) => {
    callbacks[callbacks.counter] = { resolve, reject };
    sendMessageToMain({
      event: POST_MESSAGE_EVENTS.getState,
      iframeId,
      requestId: callbacks.counter++,
    });
  });

/**
 * Set state for the plugin
 *
 * @async
 * @param {any} state
 * @returns {Promise.<any>} state
 * @throws {Error}
 */
export const setState = (state) =>
  new Promise((resolve, reject) => {
    callbacks[callbacks.counter] = { resolve, reject };
    sendMessageToMain({
      event: POST_MESSAGE_EVENTS.setState,
      iframeId,
      state,
      requestId: callbacks.counter++,
    });
  });

/**
 * Parse Redis response
 * Returns string with parsed cli-like response
 *
 * @async
 * @param {any} response
 * @param {String} command
 * @returns {Promise.<string>} data
 * @throws {Error}
 */
export const formatRedisReply = (response, command = '') =>
  new Promise((resolve, reject) => {
    callbacks[callbacks.counter] = { resolve, reject };
    sendMessageToMain({
      event: POST_MESSAGE_EVENTS.formatRedisReply,
      iframeId,
      data: { response, command },
      requestId: callbacks.counter++,
    });
  });
