import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';

export class DefaultInfoStrategy extends AbstractInfoStrategy {
  async getLength(): Promise<number> {
    return null;
  }
}
