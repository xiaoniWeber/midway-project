import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('sys_menu_interface')
export class MenuInterfaceEntity extends BaseEntity {
  @Column({ comment: '菜单id' })
  menuId?: string;
  @Column({ comment: '请求方式' })
  method?: string;
  @Column({ comment: 'path' })
  path?: string;
}
