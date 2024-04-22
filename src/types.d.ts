declare global {
  type Nullable<T> = T | null

  namespace Express {
    interface User {
      id?: string
    }
  }
}

export {}
