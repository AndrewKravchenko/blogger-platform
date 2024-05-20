import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 15 })
  name: string

  @Column({ length: 500 })
  description: string

  @Column({ length: 100 })
  websiteUrl: string

  @Column()
  isMembership: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
