import {
  Rdi,
  RdiClientMetadata,
  RdiPipeline,
  RdiStatisticsResult,
} from 'src/modules/rdi/models';
import {
  RdiDryRunJobDto,
  RdiDryRunJobResponseDto,
  RdiTemplateResponseDto,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import { IDLE_THRESHOLD } from 'src/modules/rdi/constants';

export abstract class RdiClient {
  public readonly id: string;

  public lastUsed: number = Date.now();

  protected constructor(
    public readonly metadata: RdiClientMetadata,
    protected readonly rdi: Rdi,
  ) {
    this.id = RdiClient.generateId(this.metadata);
  }

  public isIdle(): boolean {
    return Date.now() - this.lastUsed > IDLE_THRESHOLD;
  }

  abstract getSchema(): Promise<object>;

  abstract getPipeline(): Promise<RdiPipeline>;

  abstract getConfigTemplate(
    pipelineType: string,
    dbType: string,
  ): Promise<RdiTemplateResponseDto>;

  abstract getJobTemplate(
    pipelineType: string,
  ): Promise<RdiTemplateResponseDto>;

  abstract getStrategies(): Promise<object>;

  abstract deploy(pipeline: RdiPipeline): Promise<void>;

  abstract stopPipeline(): Promise<void>;

  abstract startPipeline(): Promise<void>;

  abstract resetPipeline(): Promise<void>;

  abstract dryRunJob(data: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto>;

  abstract testConnections(
    config: object,
  ): Promise<RdiTestConnectionsResponseDto>;

  abstract getStatistics(sections?: string): Promise<RdiStatisticsResult>;

  abstract getPipelineStatus(): Promise<any>;

  abstract getJobFunctions(): Promise<object>;

  abstract ensureAuth(): Promise<void>;

  abstract connect(): Promise<void>;

  public setLastUsed(): void {
    this.lastUsed = Date.now();
  }

  static generateId(cm: RdiClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const id = [cm.id].join(separator);

    const uId = [
      cm.sessionMetadata?.userId || empty,
      cm.sessionMetadata?.accountId || empty,
      cm.sessionMetadata?.sessionId || empty,
      cm.sessionMetadata?.uniqueId || empty,
    ].join(separator);

    return [id, uId].join(separator);
  }
}
