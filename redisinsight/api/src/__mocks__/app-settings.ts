import { Settings } from 'src/modules/settings/models/settings';
import { Agreements } from 'src/modules/settings/models/agreements';
import { mockUserId } from 'src/__mocks__/user';
import { GetAppSettingsResponse } from 'src/modules/settings/dto/settings.dto';
import { AgreementsEntity } from 'src/modules/settings/entities/agreements.entity';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';

export const mockSettings = Object.assign(new Settings(), {
  id: mockUserId,
  data: {
    theme: 'DARK',
    scanThreshold: 500,
    batchSize: 10,
    dateFormat: null,
    timezone: null,
  },
});

export const mockSettingsEntity = Object.assign(new SettingsEntity(), {
  id: mockSettings.id,
  data: JSON.stringify(mockSettings.data),
});

export const mockAgreements = Object.assign(new Agreements(), {
  id: mockUserId,
  version: '1.0.0',
  data: {
    eula: true,
    analytics: true,
    encryption: true,
    notifications: true,
  },
});

export const mockAgreementsEntity = Object.assign(new AgreementsEntity(), {
  id: mockAgreements.id,
  version: mockAgreements.version,
  data: JSON.stringify(mockAgreements.data),
});

export const mockAppSettings = Object.assign(new GetAppSettingsResponse(), {
  ...mockSettings.data,
  agreements: {
    version: mockAgreements.version,
    ...mockAgreements.data,
  },
});

export const mockAppSettingsWithoutPermissions = Object.assign(
  new GetAppSettingsResponse(),
  {
    ...mockSettings.data,
    agreements: {
      version: mockAgreements.version,
      eula: false,
      analytics: false,
      encryption: false,
      notifications: false,
    },
  },
);

export const mockAppSettingsInitial = Object.assign(
  new GetAppSettingsResponse(),
  {
    agreements: null,
  },
);

export const mockAgreementsRepository = jest.fn(() => ({
  getOrCreate: jest.fn(),
  update: jest.fn(),
  reset: jest.fn(),
}));

export const mockSettingsRepository = jest.fn(() => ({
  getOrCreate: jest.fn(),
  update: jest.fn(),
}));

export const mockSettingsService = jest.fn(() => ({
  getAppSettings: jest.fn(),
  updateAppSettings: jest.fn(),
  getAgreementsSpec: jest.fn(),
}));
