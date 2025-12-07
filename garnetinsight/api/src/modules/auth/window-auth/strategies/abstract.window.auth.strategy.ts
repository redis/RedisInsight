export abstract class AbstractWindowAuthStrategy {
  abstract isAuthorized(data: any): Promise<boolean>;
}
