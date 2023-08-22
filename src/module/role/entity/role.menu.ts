import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('sys_role_menu')
export class RoleMenuEntity extends BaseEntity {
  @Column({ comment: '角色id' })
  roleId?: number;
  @Column({ comment: '菜单id' })
  menuId?: number;
}
