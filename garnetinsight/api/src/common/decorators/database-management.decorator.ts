import { applyDecorators, UseGuards } from '@nestjs/common';
import { DatabaseManagementGuard } from 'src/common/guards/database-management.guard';

export function DatabaseManagement() {
  return applyDecorators(UseGuards(new DatabaseManagementGuard()));
}
