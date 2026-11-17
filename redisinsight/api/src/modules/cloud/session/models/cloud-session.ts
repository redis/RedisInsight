import { CloudUser } from 'src/modules/cloud/user/models';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';
import { Expose, Type } from 'class-transformer';

export class CloudSession {
  @Expose()
  accessToken?: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  idToken?: string;

  @Expose()
  idpType?: CloudAuthIdpType;

  @Expose()
  csrf?: string;

  @Expose()
  apiSessionId?: string;

  // session id set by an mfa-challenged login; the mfa_code re-login must
  // reuse it so the cloud api can correlate the pending challenge
  @Expose()
  mfaApiSessionId?: string;

  @Expose()
  user?: CloudUser;
}

export class CloudSessionData {
  @Expose()
  id: number;

  @Expose()
  @Type(() => CloudSession)
  data: CloudSession;
}
