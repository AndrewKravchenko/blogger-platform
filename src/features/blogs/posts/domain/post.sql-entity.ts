import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '../../../../base/entities/base.entity'
import { Blog } from '../../blogs/domain/blog.sql-entity'
import { Comment } from '../../comments/domain/comment.sql-entity'

export type CreatePostModel = {
  title: string
  shortDescription: string
  content: string
  blogId: string
}

@Entity({ name: 'Post' })
export class Post extends BaseEntity<Post> {
  @Column({ length: 30 })
  title: string

  @Column({ length: 100 })
  shortDescription: string

  @Column({ length: 1000 })
  content: string

  @Column('uuid')
  blogId: string

  @Column({ default: 0 })
  likesCount: number

  @Column({ default: 0 })
  dislikesCount: number

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  blog: Blog
}
