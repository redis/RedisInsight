import { FormatterTypes, IFormatterStrategy } from './formatter.interface';

export class FormatterManager {
  private strategies = {};

  addStrategy(name: FormatterTypes, strategy: IFormatterStrategy): void {
    this.strategies[name] = strategy;
  }

  getStrategy(name: FormatterTypes): IFormatterStrategy {
    if (!this.strategies[name]) {
      throw new Error(`Unsupported formatter strategy: ${name}`);
    }

    return this.strategies[name];
  }
}
