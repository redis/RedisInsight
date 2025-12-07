import { PickType } from '@nestjs/swagger';
import { ClientMetadata } from 'src/common/models/client-metadata';

export class DatabaseIndex extends PickType(ClientMetadata, ['db'] as const) {}
