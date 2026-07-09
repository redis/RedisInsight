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
    // NOQUANT (fp32): default int8 quantization lands the VSIM ELE self-match
    // just below 1 for most vectors, breaking "100 %" score assertions.
    const cmd = `VADD ${keyName} VALUES ${components.length} ${components.join(' ')} ${element.name} NOQUANT`;
    await apiHelper.sendCommand(databaseId, cmd);
  }
};
