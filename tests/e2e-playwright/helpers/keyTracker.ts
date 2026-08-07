import { ApiHelper } from './api';

/**
 * Remembers the keys a test creates so it can remove exactly those.
 *
 * Specs share a Redis instance and run on different workers, so cleaning up by
 * the common `test-` prefix deletes keys other specs are still asserting on and
 * their rows disappear mid-test. Track instead of matching a shared prefix.
 */
export const createKeyTracker = () => {
  const keyNames: string[] = [];

  return {
    /** Records a factory-built key and returns it unchanged. */
    track<T extends { keyName: string }>(keyData: T): T {
      keyNames.push(keyData.keyName);
      return keyData;
    },

    /** Records a name built without a factory, e.g. the target of a rename. */
    add(keyName: string): string {
      keyNames.push(keyName);
      return keyName;
    },

    async cleanup(apiHelper: ApiHelper, databaseId: string): Promise<void> {
      const pending = keyNames.splice(0);
      const unresolved: string[] = [];
      let failure: unknown;

      // Names carry a faker suffix, so each is a glob matching only itself.
      for (const keyName of pending) {
        try {
          await apiHelper.deleteKeysByPattern(databaseId, keyName);
        } catch (error) {
          // Keep the key tracked so a later cleanup can still remove it, and
          // attempt the rest rather than leaking everything after the first fault.
          unresolved.push(keyName);
          failure = failure ?? error;
        }
      }

      keyNames.push(...unresolved);
      if (failure) throw failure;
    },
  };
};
