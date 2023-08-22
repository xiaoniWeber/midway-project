import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('sys_user_role')
export class UserRoleEntity extends BaseEntity {
  @Column({ comment: '用户id' })
  userId?: number;
  @Column({ comment: '角色id' })
  roleId?: number;
}
