import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { ClientMetadata } from 'src/common/models';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';

export const LOAD_SAMPLE_DATA_DEFINITION: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'load_sample_data',
    description:
      'Load bundled Redis sample data into the connected database. ' +
      'This imports a set of example keys (hashes, sets, sorted sets, etc.) that can be used for learning and exploration. ' +
      'Only call this when the user explicitly asks to load or import sample/demo data.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

export async function executeLoadSampleData(
  _args: Record<string, unknown>,
  _client: unknown,
  services: {
    bulkImportService: BulkImportService;
    clientMetadata: ClientMetadata;
  },
): Promise<string> {
  const result = await services.bulkImportService.importDefaultData(
    services.clientMetadata,
  );

  const { summary } = result;
  return (
    `Sample data import completed.\n` +
    `Status: ${result.status}\n` +
    `Processed: ${summary.processed}\n` +
    `Succeeded: ${summary.succeed}\n` +
    `Failed: ${summary.failed}`
  );
}
