import { isNil } from 'lodash';
import {
  RdiStatisticsBlocksSection,
  RdiStatisticsSection,
} from 'src/modules/rdi/models';
import * as v1StatisticsTransformers from 'src/modules/rdi/client/api/v1/transformers';
import {
  GetMetricsCollectionResponse,
  ProcessorMetricsResponse,
} from 'src/modules/rdi/client/api/v2/responses';

type ProcessingPerformance =
  ProcessorMetricsResponse['metrics']['processing_performance'];

/**
 * Transforms processing performance data to RdiStatisticsBlocksSection.
 * Extends v1 transformer with 2 additional fields: transform_time_avg and write_time_avg
 */
export const transformProcessingPerformance = (
  data: ProcessingPerformance,
): RdiStatisticsBlocksSection => {
  const result = v1StatisticsTransformers.transformProcessingPerformance(data);

  // Add new v2 fields
  if (!isNil(data?.transform_time_avg)) {
    result.data.push({
      label: 'Transform time average',
      value: data.transform_time_avg,
      units: 'ms',
    });
  }

  if (!isNil(data?.write_time_avg)) {
    result.data.push({
      label: 'Write time average',
      value: data.write_time_avg,
      units: 'ms',
    });
  }

  return result;
};

/**
 * Extracts processor metrics from the v2 metrics collection response
 */
const getProcessorMetrics = (
  data: GetMetricsCollectionResponse,
): ProcessorMetricsResponse['metrics'] | null => {
  const processorMetrics = data.find(
    (item) => item.component === 'processor',
  ) as ProcessorMetricsResponse | undefined;

  return processorMetrics?.metrics || null;
};

/**
 * Transforms v2 metrics collection response to RdiStatisticsSection array.
 * Reuses v1 transformers for most sections, uses extended transformer for processing performance.
 */
export const transformMetricsCollectionResponse = (
  data: GetMetricsCollectionResponse,
): RdiStatisticsSection[] => {
  const processorMetrics = getProcessorMetrics(data);

  if (!processorMetrics) {
    return [];
  }

  return [
    v1StatisticsTransformers.transformGeneralInfo(
      processorMetrics.rdi_pipeline_status,
    ),
    transformProcessingPerformance(processorMetrics.processing_performance),
    v1StatisticsTransformers.transformConnectionsStatistics(
      processorMetrics.connections,
    ),
    v1StatisticsTransformers.transformDataStreamsStatistics(
      processorMetrics.data_streams,
    ),
    v1StatisticsTransformers.transformClientStatistics(
      processorMetrics.clients,
    ),
  ];
};
