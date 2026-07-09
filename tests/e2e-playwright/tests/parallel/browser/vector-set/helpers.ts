import { ApiHelper } from 'e2eSrc/helpers';
import { VectorSetElement } from 'e2eSrc/types';

export const seedVectorSet = async (
  apiHelper: ApiHelper,
  databaseId: string,
  keyName: string,
  elements: VectorSetElement[],
  { noquant = false }: { noquant?: boolean } = {},
): Promise<void> => {
  for (const element of elements) {
    const components = element.vector.split(',').map((v) => v.trim());
    // NOQUANT (fp32) keeps the VSIM ELE self-match at exactly 1 for score
    // assertions. Off by default: the app's own VADD sends no quantization
    // token, so it can only append to default-quantized (int8) sets.
    const quant = noquant ? ' NOQUANT' : '';
    const cmd = `VADD ${keyName} VALUES ${components.length} ${components.join(' ')} ${element.name}${quant}`;
    await apiHelper.sendCommand(databaseId, cmd);
  }
};
