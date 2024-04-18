export const paginationSkip = (pageNumber: number, pageSize: number) => {
  return (pageNumber - 1) * pageSize
}
