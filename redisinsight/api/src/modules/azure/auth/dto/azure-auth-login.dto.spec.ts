import { validate } from 'class-validator';
import { faker } from '@faker-js/faker';
import { AzureAuthLoginDto } from './azure-auth-login.dto';

const validateTenantId = async (tenantId: string | undefined) => {
  const dto = new AzureAuthLoginDto();
  dto.tenantId = tenantId;
  return validate(dto);
};

describe('AzureAuthLoginDto', () => {
  describe('tenantId', () => {
    it('should be optional (no error when omitted)', async () => {
      expect(await validateTenantId(undefined)).toHaveLength(0);
    });

    it('should accept a GUID tenant id', async () => {
      expect(await validateTenantId(faker.string.uuid())).toHaveLength(0);
    });

    it('should accept an onmicrosoft.com domain', async () => {
      expect(
        await validateTenantId('your-tenant.onmicrosoft.com'),
      ).toHaveLength(0);
    });

    it.each(['not a tenant', 'foo bar', 'http://your-tenant.com', ' ', 'a'])(
      'should reject invalid tenant id %p',
      async (input) => {
        const errors = await validateTenantId(input);
        expect(errors.length).toBeGreaterThan(0);
      },
    );
  });
});
