import { isNil } from 'lodash';
import { plainToInstance } from 'class-transformer';
import {
  RdiStatisticsBlocksSection,
  RdiStatisticsInfoSection,
  RdiStatisticsSection,
  RdiStatisticsTableSection,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import { GetStatisticsResponse } from 'src/modules/rdi/client/api/v1/responses';
import { generateColumns } from 'src/modules/rdi/utils/transformer.util';

export const transformProcessingPerformance = (
  data: GetStatisticsResponse['processing_performance'],
): RdiStatisticsBlocksSection => {
  const blocks = [];

  if (!isNil(data?.total_batches)) {
    blocks.push({
      label: 'Total batches',
      value: data.total_batches,
      units: 'Total',
    });
  }

  if (!isNil(data?.batch_size_avg)) {
    blocks.push({
      label: 'Batch size average',
      value: data.batch_size_avg,
      units: 'MB',
    });
  }

  if (!isNil(data?.process_time_avg)) {
    blocks.push({
      label: 'Process time average',
      value: data.process_time_avg,
      units: 'ms',
    });
  }

  if (!isNil(data?.ack_time_avg)) {
    blocks.push({
      label: 'ACK time average',
      value: data.ack_time_avg,
      units: 'sec',
    });
  }

  if (!isNil(data?.read_time_avg)) {
    blocks.push({
      label: 'Read time average',
      value: data.read_time_avg,
      units: 'ms',
    });
  }

  if (!isNil(data?.rec_per_sec_avg)) {
    blocks.push({
      label: 'Records per second average',
      value: data.rec_per_sec_avg,
      units: 'sec',
    });
  }

  if (!isNil(data?.total_time_avg)) {
    blocks.push({
      label: 'Total time average',
      value: data.total_time_avg,
      units: 'ms',
    });
  }

  return plainToInstance(RdiStatisticsBlocksSection, {
    name: 'Processing performance information',
    view: RdiStatisticsViewType.Blocks,
    data: blocks,
  });
};

export const transformClientStatistics = (
  data: GetStatisticsResponse['clients'],
): RdiStatisticsTableSection => {
  // Convert the Record<string, {...}> to an array of objects
  const clientsArray = Object.entries(data || {}).map(
    ([_key, client]) => client,
  );

  // Custom column headers (override auto-generated ones)
  const customColumns = {
    id: 'ID',
    addr: 'ADDR',
  };

  return plainToInstance(RdiStatisticsTableSection, {
    name: 'Clients',
    view: RdiStatisticsViewType.Table,
    columns: generateColumns(clientsArray, customColumns),
    data: clientsArray,
  });
};

export const transformDataStreamsStatistics = (
  data: GetStatisticsResponse['data_streams'],
): RdiStatisticsTableSection => {
  // Convert the Record<string, {...}> to an array of objects
  const streamsArray = Object.entries(data?.streams || {}).map(
    ([key, stream]) => ({
      name: key,
      ...stream,
    }),
  );

  // Custom column configuration for date formatting
  const customColumns = {
    last_arrival: { header: 'Last arrival', type: 'date' },
  };

  return plainToInstance(RdiStatisticsTableSection, {
    name: 'Data Streams',
    view: RdiStatisticsViewType.Table,
    columns: generateColumns(streamsArray, customColumns),
    data: streamsArray,
    footer: {
      name: 'Total',
      ...data?.totals,
    },
  });
};

export const transformGeneralInfo = (
  rdiPipelineStatus: GetStatisticsResponse['rdi_pipeline_status'],
): RdiStatisticsInfoSection => {
  const items = [
    {
      label: 'RDI version',
      value: rdiPipelineStatus?.rdi_version || '',
    },
    {
      label: 'RDI database address',
      value: rdiPipelineStatus?.address || '',
    },
    {
      label: 'Run status',
      value: rdiPipelineStatus?.run_status || '',
    },
    {
      label: 'Sync mode',
      value: rdiPipelineStatus?.sync_mode || '',
    },
  ];

  return plainToInstance(RdiStatisticsInfoSection, {
    name: 'General info',
    view: RdiStatisticsViewType.Info,
    data: items,
  });
};

export const transformConnectionsStatistics = (
  data: GetStatisticsResponse['connections'],
): RdiStatisticsTableSection => {
  // Convert the Record<string, {...}> to an array of objects
  // Only include specific fields in the desired order
  const connectionsArray = Object.entries(data || {}).map(
    ([key, connection]) => ({
      status: connection.status,
      name: key,
      type: connection.type,
      host_port: `${connection.host}:${connection.port}`,
      database: connection.database,
      user: connection.user,
    }),
  );

  // Custom column headers and types
  const customColumns = {
    status: { header: 'Status', type: 'status' },
    host_port: { header: 'Host:port' },
    user: { header: 'Username' },
  };

  return plainToInstance(RdiStatisticsTableSection, {
    name: 'Target Connections',
    view: RdiStatisticsViewType.Table,
    columns: generateColumns(connectionsArray, customColumns),
    data: connectionsArray,
  });
};

export const transformStatisticsResponse = (
  data: GetStatisticsResponse,
): RdiStatisticsSection[] => {
  return [
    transformGeneralInfo(data.rdi_pipeline_status),
    transformProcessingPerformance(data.processing_performance),
    transformConnectionsStatistics(data.connections),
    transformDataStreamsStatistics(data.data_streams),
    transformClientStatistics(data.clients),
  ];
};
