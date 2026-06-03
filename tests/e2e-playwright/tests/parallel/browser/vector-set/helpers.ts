import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetElement } from 'e2eSrc/types';

/**
 * Minimum Redis major version that supports Vector Sets (VADD/VSIM).
 * Specs below use this to skip when pointed at an older instance.
 */
export const VECTOR_SET_MIN_REDIS_MAJOR = 8;

/**
 * Read the connected database's Redis major version from `INFO server`.
 * Returns 0 when the version can't be parsed, which trips the skip guard.
 */
export const getRedisMajorVersion = async (apiHelper: ApiHelper, databaseId: string): Promise<number> => {
  const info = await apiHelper.sendCommand(databaseId, 'INFO server');
  const match = String(info).match(/redis_version:(\d+)/);
  return match ? Number(match[1]) : 0;
};

/** Human-readable reason surfaced in the Playwright report for skipped specs. */
export const VECTOR_SET_SKIP_REASON = 'Vector Sets require Redis >= 8.0';

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
