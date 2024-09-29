import { Column, Entity, ManyToOne } from 'typeorm'
import { Post } from '../../posts/domain/post.sql-entity'
import { BaseEntity } from '../../../../base/entities/base.entity'

@Entity({ name: 'Comment' })
export class Comment extends BaseEntity<Comment> {
  @Column({ type: 'uuid' })
  postId: string | null

  @Column({ type: 'uuid' })
  userId: string

  @Column({ length: 300 })
  content: string

  @Column({ default: 0 })
  likesCount: number

  @Column({ default: 0 })
  dislikesCount: number

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post
}
