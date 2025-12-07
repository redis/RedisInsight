import { withTimeout } from 'src/utils/promise-with-timeout';

const timeoutException = new Error('Timeout exception');

describe('promiseWithTimeout', () => {
  it('should throw timeout exception', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('ok'), 2000);
    });

    try {
      await withTimeout(promise, 1000, timeoutException);
    } catch (error) {
      expect(error).toBe(timeoutException);
    }
  });
  it('should resolve promise', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('ok'), 500);
    });

    const result = await withTimeout(promise, 1000, timeoutException);

    expect(result).toEqual('ok');
  });
  it('should reject promise', async () => {
    const promiseException = new Error('Promise exception');
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => reject(promiseException), 500);
    });

    try {
      await withTimeout(promise, 1000, timeoutException);
    } catch (error) {
      expect(error).toBe(promiseException);
    }
  });
});
