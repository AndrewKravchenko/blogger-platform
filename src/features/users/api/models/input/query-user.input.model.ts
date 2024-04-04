import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryUserModel {
  @IsIn(['login', 'email', 'createdAt'])
  sortBy: 'login' | 'email' | 'createdAt' = 'createdAt'

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

  @IsString()
  @IsOptional()
  searchLoginTerm: string | null = null

  @IsString()
  @IsOptional()
  searchEmailTerm: string | null = null
}
