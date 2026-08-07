import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetElement } from 'e2eSrc/types';

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
