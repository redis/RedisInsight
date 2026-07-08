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
    // NOQUANT: with the default int8 quantization the VSIM ELE self-match
    // score lands slightly below 1 (e.g. 0.9995 → "99.95 %") for most random
    // vectors, making the "100 %" self-match assertion in
    // similarity-search.spec a coin flip. fp32 storage keeps it at 1 within
    // float epsilon, which still renders as "100 %".
    const cmd = `VADD ${keyName} VALUES ${components.length} ${components.join(' ')} ${element.name} NOQUANT`;
    await apiHelper.sendCommand(databaseId, cmd);
  }
};
