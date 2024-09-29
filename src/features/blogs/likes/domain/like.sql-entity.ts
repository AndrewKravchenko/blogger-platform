import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Entity({ name: 'Like' })
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'uuid', nullable: true })
  commentId?: string

  @Column({ type: 'uuid', nullable: true })
  postId?: string

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  myStatus: LikeStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  constructor(entity: Partial<Like>) {
    Object.assign(this, entity)
  }
}
