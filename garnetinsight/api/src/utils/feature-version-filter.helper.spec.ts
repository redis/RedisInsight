// Import the function to test
import { FeatureConfigFilterCondition } from 'src/modules/feature/model/features-config';
import { filterVersion } from './feature-version-filter.helper';

describe('filterVersion', () => {
  it('should return true for Eq condition when versions are equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Eq, '1.0.0', '1.0.0'),
    ).toBe(true);
  });

  it('should return false for Eq condition when versions are not equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Eq, '1.0.1', '1.0.0'),
    ).toBe(false);
  });

  it('should return false for Neq condition when versions are equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Neq, '1.0.0', '1.0.0'),
    ).toBe(false);
  });

  it('should return true for Neq condition when versions are not equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Neq, '1.0.1', '1.0.0'),
    ).toBe(true);
  });

  it('should return true for Gt condition when first version is greater', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Gt, '1.0.1', '1.0.0'),
    ).toBe(true);
  });

  it('should return false for Gt condition when first version is not greater', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Gt, '1.0.0', '1.0.1'),
    ).toBe(false);
  });

  it('should return true for Gte condition when first version is greater', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Gte, '1.0.1', '1.0.0'),
    ).toBe(true);
  });

  it('should return true for Gte condition when versions are equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Gte, '1.0.0', '1.0.0'),
    ).toBe(true);
  });

  it('should return false for Gte condition when first version is less', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Gte, '1.0.0', '1.0.1'),
    ).toBe(false);
  });

  it('should return true for Lt condition when first version is less', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Lt, '1.0.0', '1.0.1'),
    ).toBe(true);
  });

  it('should return false for Lt condition when first version is not less', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Lt, '1.0.1', '1.0.0'),
    ).toBe(false);
  });

  it('should return true for Lte condition when first version is less', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Lte, '1.0.0', '1.0.1'),
    ).toBe(true);
  });

  it('should return true for Lte condition when versions are equal', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Lte, '1.0.0', '1.0.0'),
    ).toBe(true);
  });

  it('should return false for Lte condition when first version is greater', () => {
    expect(
      filterVersion(FeatureConfigFilterCondition.Lte, '1.0.1', '1.0.0'),
    ).toBe(false);
  });

  it('should return false for unknown condition', () => {
    expect(
      filterVersion(
        'UnknownCondition' as FeatureConfigFilterCondition,
        '1.0.0',
        '1.0.0',
      ),
    ).toBe(false);
  });
});
