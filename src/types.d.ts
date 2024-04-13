declare global {
  type Nullable<T> = T | null

  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      ENV: string
      AUTH_LOGIN: string
      AUTH_PASSWORD: string
      MONGO_URI: string
      DB_NAME: string
      JWT_SECRET: string
    }
  }

  namespace Express {
    interface User {
      id?: string
    }
  }
}

export {}
