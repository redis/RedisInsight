import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetKeyFactory } from 'e2eSrc/test-data/browser';
import { VectorSetElement, VectorSetKeyData } from 'e2eSrc/types';

/**
 * Builds vector set keys and remembers them so a test can remove exactly what it
 * created.
 *
 * Every vector set key shares the `test-vector-set-` prefix, and these specs all
 * target the same Redis while running on different workers, so cleaning up by
 * prefix deletes keys other specs are still using and their elements vanish
 * mid-test.
 */
export const createKeyTracker = () => {
  const keyNames: string[] = [];

  return {
    build(overrides?: Partial<VectorSetKeyData>): VectorSetKeyData {
      const keyData = VectorSetKeyFactory.build(overrides);
      keyNames.push(keyData.keyName);
      return keyData;
    },

    async cleanup(apiHelper: ApiHelper, databaseId: string): Promise<void> {
      // Names come from faker, so each is a glob matching only itself.
      for (const keyName of keyNames.splice(0)) {
        await apiHelper.deleteKeysByPattern(databaseId, keyName);
      }
    },
  };
};

export const seedVectorSet = async (
  apiHelper: ApiHelper,
  databaseId: string,
  keyName: string,
  elements: VectorSetElement[],
): Promise<void> => {
  for (const element of elements) {
    const components = element.vector.split(',').map((v) => v.trim());
    const cmd = `VADD ${keyName} VALUES ${components.length} ${components.join(' ')} ${element.name}`;
    await apiHelper.sendCommand(databaseId, cmd);
  }
};
