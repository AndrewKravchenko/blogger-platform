import { config } from 'dotenv'
import process from 'process'

config({ path: `./env/.${process.env.NODE_ENV}.env` })

export type EnvironmentVariable = { [key: string]: string | undefined }
export type EnvironmentsTypes = 'dev' | 'prod'
export const Environments = ['dev', 'prod']

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env
  }

  isProduction() {
    return this.env === 'prod'
  }

  isDevelopment() {
    return this.env === 'dev'
  }
}

class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  public readonly PORT: number
  public readonly MONGO_URI: string

  constructor(private readonly envVariables: EnvironmentVariable) {
    this.PORT = this.getNumberOrDefault(envVariables.PORT, 5000)
    this.MONGO_URI = envVariables.MONGO_URI ?? 'mongodb://localhost:27017'
  }

  private getNumberOrDefault(value: string | undefined, defaultValue: number): number {
    const parsedValue = Number(value)

    if (isNaN(parsedValue)) {
      return defaultValue
    }

    return parsedValue
  }
}

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV?.trim()) ? process.env.ENV.trim() : 'dev') as EnvironmentsTypes,
)

const api = new APISettings(process.env)

export const appSettings = new AppSettings(env, api)
