import {
  CliOutputFormatterTypes,
  IOutputFormatterStrategy,
} from './output-formatter.interface';

export class OutputFormatterManager {
  private strategies = {};

  addStrategy(
    name: CliOutputFormatterTypes,
    strategy: IOutputFormatterStrategy,
  ): void {
    this.strategies[name] = strategy;
  }

  getStrategy(name: CliOutputFormatterTypes): IOutputFormatterStrategy {
    if (!this.strategies[name]) {
      throw new Error(`Unsupported formatter strategy: ${name}`);
    }

    return this.strategies[name];
  }
}
