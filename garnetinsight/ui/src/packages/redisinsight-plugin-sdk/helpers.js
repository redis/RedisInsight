/**
 * helper function to send postMessage to the main app
 *
 * @param data
 */
export const sendMessageToMain = (data = {}) => {
  const event = document.createEvent('Event');
  event.initEvent('message', true, true);
  event.data = data;
  event.origin = '*';
  // eslint-disable-next-line no-restricted-globals
  parent.dispatchEvent(event);
};
