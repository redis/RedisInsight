import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetElement } from 'e2eSrc/types';

export const VECTOR_SET_MIN_REDIS_MAJOR = 8;

export const VECTOR_SET_SKIP_REASON = 'Vector Sets require Redis >= 8.0';

export const getRedisMajorVersion = async (apiHelper: ApiHelper, databaseId: string): Promise<number> => {
  const info = await apiHelper.sendCommand(databaseId, 'INFO server');
  const match = String(info).match(/redis_version:(\d+)/);
  return match ? Number(match[1]) : 0;
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
