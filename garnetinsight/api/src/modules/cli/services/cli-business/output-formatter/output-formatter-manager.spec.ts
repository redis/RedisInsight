import { Test, TestingModule } from '@nestjs/testing';
import { TextFormatterStrategy } from './strategies/text-formatter.strategy';
import {
  CliOutputFormatterTypes,
  IOutputFormatterStrategy,
} from './output-formatter.interface';
import { OutputFormatterManager } from './output-formatter-manager';

class TestFormatterStrategy implements IOutputFormatterStrategy {
  public format() {
    return '';
  }
}
const strategyName = CliOutputFormatterTypes.Raw;
const testStrategy = new TestFormatterStrategy();

describe('OutputFormatterManager', () => {
  let outputFormatter: OutputFormatterManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputFormatterManager],
    }).compile();

    outputFormatter = module.get<OutputFormatterManager>(
      OutputFormatterManager,
    );
  });
  it('Should throw error if no strategy', () => {
    try {
      outputFormatter.getStrategy(strategyName);
    } catch (e) {
      expect(e.message).toEqual(
        `Unsupported formatter strategy: ${strategyName}`,
      );
    }
  });
  it('Should add strategy to formatter and get it back', () => {
    outputFormatter.addStrategy(strategyName, testStrategy);
    expect(outputFormatter.getStrategy(strategyName)).toEqual(testStrategy);
  });
  it('Should support TextFormatter strategy', () => {
    outputFormatter.addStrategy(
      CliOutputFormatterTypes.Text,
      new TextFormatterStrategy(),
    );
    expect(
      outputFormatter.getStrategy(CliOutputFormatterTypes.Text),
    ).toBeInstanceOf(TextFormatterStrategy);
  });
});
