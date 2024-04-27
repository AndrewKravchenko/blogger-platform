import { IsNumber, IsOptional, IsString, ValidateNested, validateSync } from 'class-validator'
import { EnvironmentSettings } from './env-settings'
import process from 'process'

export type EnvironmentVariables = { [key: string]: string }

export class DatabaseSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsString()
  MONGO_URI: string = this.environmentVariables.MONGO_URI

  @IsOptional()
  @IsString()
  MONGO_TEST_URI: string = this.environmentVariables.MONGO_TEST_URI

  @IsOptional()
  @IsString()
  MONGO_DEV_URI: string = this.environmentVariables.MONGO_DEV_URI
}

export class ApiSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsNumber()
  PORT: number = +this.environmentVariables.PORT
}

export class JwtSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsString()
  JWT_SECRET: string = this.environmentVariables.JWT_SECRET

  @IsNumber()
  ACCESS_TOKEN_EXPIRY: number = +this.environmentVariables.ACCESS_TOKEN_EXPIRY

  @IsNumber()
  REFRESH_TOKEN_EXPIRY: number = +this.environmentVariables.REFRESH_TOKEN_EXPIRY
}

export class EmailSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsString()
  EMAIL_USER: string = this.environmentVariables.EMAIL_USER

  @IsString()
  EMAIL_PASSWORD: string = this.environmentVariables.EMAIL_PASSWORD
}

export class BasicCredentialsSettings {
  constructor(private environmentVariables: EnvironmentVariables) {}
  @IsString()
  AUTH_LOGIN: string = this.environmentVariables.AUTH_LOGIN

  @IsString()
  AUTH_PASSWORD: string = this.environmentVariables.AUTH_PASSWORD
}

export class Configuration {
  @ValidateNested()
  apiSettings: ApiSettings

  @ValidateNested()
  databaseSettings: DatabaseSettings

  @ValidateNested()
  environmentSettings: EnvironmentSettings

  @ValidateNested()
  jwtSettings: JwtSettings

  @ValidateNested()
  emailSettings: EmailSettings

  @ValidateNested()
  basicCredentials: BasicCredentialsSettings

  private constructor(configuration: Configuration) {
    Object.assign(this, configuration)
  }

  static createConfig(environmentVariables: Record<string, string>): Configuration {
    return new this({
      apiSettings: new ApiSettings(environmentVariables),
      databaseSettings: new DatabaseSettings(environmentVariables),
      environmentSettings: new EnvironmentSettings(environmentVariables),
      jwtSettings: new JwtSettings(environmentVariables),
      emailSettings: new EmailSettings(environmentVariables),
      basicCredentials: new BasicCredentialsSettings(environmentVariables),
    })
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const validatedConfig = Configuration.createConfig(environmentVariables)
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }

  return validatedConfig
}

export default () => {
  const environmentVariables = process.env as EnvironmentVariables
  console.log('process.env.ENV =', environmentVariables.ENV)

  return Configuration.createConfig(environmentVariables)
}
