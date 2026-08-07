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
      // Names carry a faker suffix, so each is a glob matching only itself.
      for (const keyName of keyNames.splice(0)) {
        await apiHelper.deleteKeysByPattern(databaseId, keyName);
      }
    },
  };
};
