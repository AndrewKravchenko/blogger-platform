import { IsEnum } from 'class-validator'
import { EnvironmentVariables } from './configuration'

export enum Environments {
  TEST = 'TEST',
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
}

export class EnvironmentSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsEnum(Environments)
  private ENV = this.environmentVariables.ENV

  get isProduction(): boolean {
    return this.environmentVariables.ENV === Environments.PRODUCTION
  }

  get isTesting(): boolean {
    return this.environmentVariables.ENV === Environments.TEST
  }

  get isDevelopment(): boolean {
    return this.environmentVariables.ENV === Environments.DEVELOPMENT
  }

  get currentEnv() {
    return this.ENV
  }
}
