import { Injectable } from '@nestjs/common'
import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
import { QueryPostModel } from '../api/models/input/query-post.input.model'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LikeStatus } from '../../likes/domain/like.entity'
import { Post } from '../domain/post.sql-entity'

@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async getPosts(query: QueryPostModel, userId?: string): Promise<PaginatedResponse<PostOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.*')
      .addSelect('b.name', 'blogName')
      .addSelect((subQuery) => {
        return subQuery
          .select('l."myStatus"')
          .from('Like', 'l')
          .where('l."postId" = p.id')
          .andWhere('l."userId" = :userId', { userId })
          .limit(1)
      })
      .addSelect((subQuery) => {
        return subQuery
          .select(
            `json_agg(json_build_object('userId', sub_l."userId", 'createdAt', sub_l."createdAt", 'login', sub_l."login"))`,
          )
          .from((qb) => {
            return qb
              .select('l."userId", l."createdAt", u."login"')
              .from('Like', 'l')
              .leftJoin('User', 'u', 'l."userId" = u.id')
              .where('l."postId" = p.id')
              .andWhere('l."myStatus" = :likeStatus', { likeStatus: LikeStatus.Like })
              .orderBy('l."createdAt"', 'DESC')
              .limit(3)
          }, 'sub_l')
      }, 'newestLikes')
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset(paginationSkip(pageNumber, pageSize))
      .getRawMany()

    const totalCount = await this.postsRepository.createQueryBuilder().getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: (posts || []).map(PostOutputDataBaseMapper),
    }
  }

  async getPostsByBlogId(
    blogId: string,
    postQuery: QueryPostModel,
    userId?: string,
  ): Promise<PaginatedResponse<PostOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = postQuery

    const posts = await this.postsRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.*')
      .addSelect('b.name', 'blogName')
      .addSelect((subQuery) => {
        return subQuery
          .select('l."myStatus"')
          .from('Like', 'l')
          .where('l."postId" = p.id')
          .andWhere('l."userId" = :userId', { userId })
          .limit(1)
      })
      .addSelect((subQuery) => {
        return subQuery
          .select(
            `json_agg(json_build_object('userId', sub_l."userId", 'createdAt', sub_l."createdAt", 'login', sub_l."login"))`,
          )
          .from((qb) => {
            return qb
              .select('l."userId", l."createdAt", u."login"')
              .from('Like', 'l')
              .leftJoin('User', 'u', 'l."userId" = u.id')
              .where('l."postId" = p.id')
              .andWhere('l."myStatus" = :likeStatus', { likeStatus: LikeStatus.Like })
              .orderBy('l."createdAt"', 'DESC')
              .limit(3)
          }, 'sub_l')
      }, 'newestLikes')
      .where('p."blogId" = :blogId', { blogId })
      .orderBy(`p.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset(paginationSkip(pageNumber, pageSize))
      .getRawMany()

    const totalCount = await this.postsRepository
      .createQueryBuilder('p')
      .where('p."blogId" = :blogId', { blogId })
      .getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map(PostOutputDataBaseMapper),
    }
  }

  public async getPostById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const post = await this.postsRepository
      .createQueryBuilder('p')
      .select('p.*')
      .leftJoin('p.blog', 'b')
      .addSelect('b.name', 'blogName')
      .addSelect((subQuery) => {
        return subQuery
          .select('l."myStatus"')
          .from('Like', 'l')
          .where('l."postId" = p.id')
          .andWhere('l."userId" = :userId', { userId })
          .limit(1)
      })
      .addSelect((subQuery) => {
        return subQuery
          .select(
            `json_agg(json_build_object('userId', sub_l."userId", 'createdAt', sub_l."createdAt", 'login', sub_l."login"))`,
          )
          .from((qb) => {
            return qb
              .select('l."userId", l."createdAt", u."login"')
              .from('Like', 'l')
              .leftJoin('User', 'u', 'l."userId" = u.id')
              .where('l."postId" = p.id')
              .andWhere('l."myStatus" = :likeStatus', { likeStatus: LikeStatus.Like })
              .orderBy('l."createdAt"', 'DESC')
              .limit(3)
          }, 'sub_l')
      }, 'newestLikes')
      .where('p.id = :postId', { postId })
      .getRawOne()

    if (!post) {
      return null
    }

    return PostOutputDataBaseMapper(post)
  }
}
