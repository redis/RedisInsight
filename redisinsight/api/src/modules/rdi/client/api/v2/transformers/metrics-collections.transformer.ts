import { isNil } from 'lodash';
import { plainToInstance } from 'class-transformer';
import {
  RdiStatisticsBlocksSection,
  RdiStatisticsSection,
  RdiStatisticsTableSection,
  RdiStatisticsViewType,
} from 'src/modules/rdi/models';
import * as v1StatisticsTransformers from 'src/modules/rdi/client/api/v1/transformers';
import {
  GetMetricsCollectionResponse,
  GetStatusResponse,
  ProcessorMetricsResponse,
} from 'src/modules/rdi/client/api/v2/responses';
import { generateColumns } from 'src/modules/rdi/utils/transformer.util';

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
 * Transforms component status data to RdiStatisticsTableSection.
 * Creates a table section showing component name, type, version, status, and errors.
 */
export const transformComponentStatus = (
  components: GetStatusResponse['components'],
): RdiStatisticsTableSection | null => {
  if (!components?.length) {
    return null;
  }

  const componentData = components.map((component) => ({
    status: component.status,
    name: component.name,
    type: component.type,
    version: component.version,
    errors: component.errors?.join(', ') || '',
  }));

  return plainToInstance(RdiStatisticsTableSection, {
    name: 'Component Status',
    view: RdiStatisticsViewType.Table,
    columns: generateColumns(componentData),
    data: componentData,
  });
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
 * Optionally includes Component Status section when status data is provided (v2 only).
 */
export const transformMetricsCollectionResponse = (
  data: GetMetricsCollectionResponse,
  statusData?: GetStatusResponse | null,
): RdiStatisticsSection[] => {
  const processorMetrics = getProcessorMetrics(data);

  if (!processorMetrics) {
    return [];
  }

  const sections: RdiStatisticsSection[] = [
    v1StatisticsTransformers.transformGeneralInfo(
      processorMetrics.rdi_pipeline_status,
    ),
    transformProcessingPerformance(processorMetrics.processing_performance),
    v1StatisticsTransformers.transformConnectionsStatistics(
      processorMetrics.connections,
    ),
  ];

  // Add Component Status after Target Connections (v2 only)
  const componentStatusSection = statusData
    ? transformComponentStatus(statusData.components)
    : null;
  if (componentStatusSection) {
    sections.push(componentStatusSection);
  }

  sections.push(
    v1StatisticsTransformers.transformDataStreamsStatistics(
      processorMetrics.data_streams,
    ),
    v1StatisticsTransformers.transformClientStatistics(
      processorMetrics.clients,
    ),
  );

  return sections;
};
