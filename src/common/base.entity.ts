import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  // 设置主键id 自增
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn({ comment: '创建时间' })
  createDate?: Date;
  @UpdateDateColumn({ comment: '更新时间' })
  updateDate?: Date;
  toVO?(): any {
    return this;
  }
}
