import { Provide } from '@midwayjs/decorator';
import { InjectDataSource, InjectEntityModel } from '@midwayjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from '../../../common/base.service';
import { RoleEntity } from '../entity/role';
import { RoleDTO } from '../dto/role';
import { RoleMenuEntity } from '../entity/role.menu';
@Provide()
export class RoleService extends BaseService<RoleEntity> {
  @InjectEntityModel(RoleEntity)
  roleModel: Repository<RoleEntity>;
  @InjectDataSource()
  defaultDataSource: DataSource;
  @InjectEntityModel(RoleMenuEntity)
  roleMenuModel: Repository<RoleMenuEntity>;
  getModel(): Repository<RoleEntity> {
    return this.roleModel;
  }
  async createRole(data: RoleDTO) {
    const isExist = (await this.roleModel.countBy({ code: data.code })) > 0;
    if (isExist) {
      throw new Error('角色编码已存在');
    }
    this.defaultDataSource.transaction(async manager => {
      const entity = data.toEntity();
      await manager.save(RoleEntity, entity);
      const roleMenus = data.menuIds.map(menuId => {
        const roleMenu = new RoleMenuEntity();
        roleMenu.menuId = menuId;
        roleMenu.roleId = entity.id;
        return roleMenu;
      });
      if (roleMenus.length) {
        // 批量插入
        await manager
          .createQueryBuilder()
          .insert()
          .into(RoleMenuEntity)
          .values(roleMenus)
          .execute();
      }
    });

    // await this.roleModel.save(entity);
    // return entity;
  }
  async editRole(entity: RoleEntity): Promise<void | RoleEntity> {
    const { name } = entity;
    const role = await this.roleModel.findOneBy({ name });
    if (role && role.id !== entity.id) {
      throw new Error('当前角色编码已存在');
    }
    await this.roleModel.save(entity);
    return entity;
  }
  async removeRole(entity: RoleEntity): Promise<void> {
    await this.roleModel.remove(entity);
  }

  async getMenusByRoleId(roleId: number) {
    const curRoleMenus = await this.roleMenuModel.find({
      where: { roleId: roleId },
    });
    return curRoleMenus;
  }
  async allocMenu(roleId: number, menuIds: number[]) {
    const curRoleMenus = await this.roleMenuModel.findBy({
      roleId,
    });

    const roleMenus = [];
    menuIds.forEach((menuId: number) => {
      const roleMenu = new RoleMenuEntity();
      roleMenu.menuId = menuId;
      roleMenu.roleId = roleId;
      roleMenus.push(roleMenu);
    });

    await this.defaultDataSource.transaction(async transaction => {
      await Promise.all([transaction.remove(RoleMenuEntity, curRoleMenus)]);
      await Promise.all([transaction.save(RoleMenuEntity, roleMenus)]);

      const oldMenuIds = curRoleMenus.map(menu => menu.menuId);
      if (oldMenuIds.length !== menuIds.length) {
        // 如果有变化，查询所有分配了该角色的用户，给对应所有用户发通知
        // const userIds = (await this.userRoleModel.findBy({ roleId })).map(
        //   userRole => userRole.userId
        // );
        // userIds.forEach(userId => {
        //   this.socketService.sendMessage(userId, {
        //     type: SocketMessageType.PermissionChange,
        //   });
        // });
      }

      // 因为数组都是数字，所以先排序，排序之后把数组转换为字符串比较，写法比较简单
      const sortOldMenuIds = oldMenuIds.sort();
      const sortMenusIds = menuIds.sort();

      if (sortOldMenuIds.join() !== sortMenusIds.join()) {
        // 如果有变化，查询所有分配了该角色的用户，给对应所有用户发通知
        // const userIds = (await this.userRoleModel.findBy({ roleId })).map(
        //   userRole => userRole.userId
        // );
        // userIds.forEach(userId => {
        //   this.socketService.sendMessage(userId, {
        //     type: SocketMessageType.PermissionChange,
        //   });
        // });
      }
    });
  }
}
