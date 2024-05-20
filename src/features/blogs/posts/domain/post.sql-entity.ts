import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export type CreatePostModel = {
  title: string
  shortDescription: string
  content: string
  blogId: string
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  constructor({ title, shortDescription, content, blogId }: CreatePostModel) {
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = blogId
  }
}
