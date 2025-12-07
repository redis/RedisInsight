import { Injectable } from '@nestjs/common';
import { AbstractWindowAuthStrategy } from './strategies/abstract.window.auth.strategy';

@Injectable()
export class WindowAuthService {
  private strategy: AbstractWindowAuthStrategy = null;

  /**
   * Return strategy on how we are going to work with app(electron) windows auth
   * @param strategy
   */
  setStrategy(strategy: AbstractWindowAuthStrategy): void {
    this.strategy = strategy;
  }

  isAuthorized(id: string = ''): Promise<boolean> {
    return this.strategy?.isAuthorized?.(id);
  }
}
