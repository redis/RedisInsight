import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetElement } from 'e2eSrc/types';

/**
 * Seed a Vector Set with the given elements via repeated VADD.
 *
 * The first VADD creates the key; subsequent calls append. Vector values are
 * stored as comma-separated floats in `VectorSetElement.vector` and passed
 * to VADD as space-separated components per VADD syntax.
 *
 * Callers control how many elements get seeded by slicing `keyData.elements`
 * before passing it in — e.g. `[keyData.elements[0]]` to leave the second
 * element free for a UI add-flow assertion.
 */
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
