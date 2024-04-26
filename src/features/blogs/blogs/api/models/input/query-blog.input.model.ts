import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryBlogInputModel {
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null

  @IsIn(['id', 'name', 'createdAt'])
  sortBy: 'id' | 'name' | 'createdAt' = 'createdAt'

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
