export const getCurrentDateISOString = (): string => {
  return new Date().toISOString()
}

export const convertUnixTimestampToISO = (timestamp: number) => {
  return new Date(timestamp * 1000).toISOString()
}
