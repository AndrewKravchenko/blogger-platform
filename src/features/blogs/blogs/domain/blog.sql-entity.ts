import { Column, Entity, OneToMany } from 'typeorm'
import { Post } from '../../posts/domain/post.sql-entity'
import { BaseEntity } from '../../../../base/entities/base.entity'

@Entity({ name: 'Blog' })
export class Blog extends BaseEntity<Blog> {
  @Column({ length: 15, collation: 'C' })
  name: string

  @Column({ length: 500 })
  description: string

  @Column({ length: 100 })
  websiteUrl: string

  @Column({ default: false })
  isMembership: boolean

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[]
}
