export enum CloudAuthServerEvent {
  Logout = 'logout',
}

export enum CloudJobEvents {
  Monitor = 'cloud:job:monitor',
}

// Error codes returned by the Redis Cloud API in response.data.errors.code
export enum CloudApiErrorCodes {
  MfaRequired = 'user-mfa-required',
  MfaInvalidCode = 'mfa-invalid-code',
  MfaQuotaExceeded = 'mfa-quota-exceeded',
}

// mfa_type value expected by the Redis Cloud API login endpoint (SMS is deprecated)
export enum CloudApiMfaType {
  Totp = 'Totp',
}
