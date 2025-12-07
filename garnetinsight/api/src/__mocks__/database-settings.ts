import { mockDatabaseId } from 'src/__mocks__/databases';
import { DatabaseSettings } from 'src/modules/database-settings/models/database-settings';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import { classToClass } from 'src/utils';
import { CreateOrUpdateDatabaseSettingDto } from 'src/modules/database-settings/dto/database-setting.dto';

export const mockDatabaseSettings = Object.assign(new DatabaseSettings(), {
  databaseId: mockDatabaseId,
  data: JSON.stringify({
    notShowConfirmationRunTutorial: false,
    showHiddenRecommendations: true,
    slowLogDurationUnit: 1,
    treeViewDelimiter: { label: 'test' },
    treeViewSort: ':',
  }),
});
export const mockDatabaseSettingsEntity = new DatabaseSettingsEntity({
  ...mockDatabaseSettings,
  id: 1,
});

export const mockDatabaseSettingsCreateDto = Object.assign(
  new CreateOrUpdateDatabaseSettingDto(),
  {
    data: {
      test: 'value',
    },
  },
);
export const mockDatabaseSettingsDto = () =>
  classToClass(DatabaseSettings, mockDatabaseSettingsEntity);

export const mockDatabaseSettingsRepository = jest.fn(() => ({
  createOrUpdate: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));
