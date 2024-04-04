import { IsIn, IsInt, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryPostModel {
  @IsIn(['id', 'blogName', 'title', 'createdAt'])
  sortBy: 'id' | 'blogName' | 'title' | 'createdAt' = 'createdAt'

  @IsIn(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc'

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 10
}
