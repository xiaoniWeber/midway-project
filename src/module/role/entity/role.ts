import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('sys_role')
export class RoleEntity extends BaseEntity {
  @Column({ comment: '角色名称' })
  name?: string;
  @Column({ comment: 'code' })
  code?: string;
}
