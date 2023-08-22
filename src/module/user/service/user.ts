import { Provide } from '@midwayjs/decorator';
import { InjectDataSource, InjectEntityModel } from '@midwayjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../../../common/base.service';
import { UserEntity } from '../entity/user';
import { UserVO } from '../vo/user';

import { R } from '../../../common/base.error.util';
import { omit } from 'lodash';
import { UserDTO } from '../dto/user';
import { UserRoleEntity } from '../entity/user.role';
@Provide()
export class UserService extends BaseService<UserEntity> {
  @InjectEntityModel(UserEntity) //注入一个实体对象
  userModel: Repository<UserEntity>;
  @InjectDataSource()
  defaultDataSource: DataSource;
  @InjectEntityModel(UserRoleEntity)
  userRoleModel: Repository<UserRoleEntity>;
  getModel(): Repository<UserEntity> {
    return this.userModel;
  }
  async createUser(userDTO: UserDTO) {
    const entity = userDTO.toEntity();
    const { userName, phoneNumber, email } = entity;
    let isExist = (await this.userModel.countBy({ userName })) > 0;
    if (isExist) {
      throw R.error('用户名已存在');
    }
    isExist = (await this.userModel.countBy({ phoneNumber })) > 0;
    if (isExist) {
      throw R.error('手机号已存在');
    }
    isExist = (await this.userModel.countBy({ email })) > 0;
    if (isExist) {
      throw R.error('邮箱已存在');
    }
    const password = bcrypt.hashSync('123456', 10);
    entity.password = password;
    // 使用事物
    await this.defaultDataSource.transaction(async manager => {
      await manager.save(UserEntity, entity);
      await manager.save(
        UserRoleEntity,
        userDTO.roleIds.map(roleId => {
          const useRole = new UserRoleEntity();
          useRole.roleId = roleId;
          useRole.userId = entity.id;
          return useRole;
        })
      );
    });
    console.log('entity', entity);
    await this.userModel.save(entity);
    return omit(entity, ['password']) as UserVO;
  }
  async editUser(userDTO: UserDTO) {
    const { userName, phoneNumber, email, id, nickName, sex } = userDTO;
    let user = await this.userModel.findOneBy({ userName });

    if (user && user.id !== id) {
      throw R.error('当前用户名已存在');
    }

    user = await this.userModel.findOneBy({ phoneNumber });

    if (user && user.id !== id) {
      throw R.error('当前手机号已存在');
    }
    user = await this.userModel.findOneBy({ phoneNumber });

    if (user && user.id !== id) {
      throw R.error('当前手机号已存在');
    }

    user = await this.userModel.findOneBy({ email });

    if (user && user.id !== id) {
      throw R.error('当前邮箱已存在');
    }

    const userRolesMap = await this.userRoleModel.findBy({
      userId: userDTO.id,
    });

    await this.defaultDataSource.transaction(async manager => {
      await manager
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          nickName,
          phoneNumber,
          sex,
        })
        .where('id = :id', { id: userDTO.id })
        .execute();
      // 先删除当前用户所有角色
      await manager.remove(UserRoleEntity, userRolesMap);
      await manager.save(
        UserRoleEntity,
        userDTO.roleIds.map(roleId => {
          const userRole = new UserRoleEntity();
          userRole.roleId = roleId;
          userRole.userId = userDTO.id;
          return userRole;
        })
      );
      // 根据当前用户id在文件表里查询
      // const fileRecord = await this.fileModel.findOneBy({
      //   pkValue: id,
      //   pkName: 'user_avatar',
      // });

      // 如果查到文件，并且当前头像是空的，只需要给原来的文件给删除就行了。
      // if (fileRecord && !avatar) {
      //   await this.fileModel.remove(fileRecord);
      // } else if (fileRecord && avatar && fileRecord.id !== avatar) {
      //   // 如果查到文件，并且有当前头像，并且原来的文件id不等于当前传过来的文件id
      //   // 删除原来的文件
      //   // 把当前的用户id更新到新文件行数据中
      //   await Promise.all([
      //     manager.delete(FileEntity, fileRecord.id),
      //     manager
      //       .createQueryBuilder()
      //       .update(FileEntity)
      //       .set({
      //         pkValue: id,
      //         pkName: 'user_avatar',
      //       })
      //       .where('id = :id', { id: userDTO.avatar })
      //       .execute(),
      //   ]);
      // } else if (!fileRecord && avatar) {
      //   // 如果以前没有文件，现在有文件，直接更新就行了
      //   manager
      //     .createQueryBuilder()
      //     .update(FileEntity)
      //     .set({
      //       pkValue: id,
      //       pkName: 'user_avatar',
      //     })
      //     .where('id = :id', { id: userDTO.avatar })
      //     .execute();
      // }

      // 检测当前用户分配的角色有没有变化，如果有变化，发通知给前端
      // const oldRoleIds = userRolesMap.map(role => role.roleId);
      // 先判断两个数量是不是一样的
      // if (oldRoleIds.length !== userDTO.roleIds.length) {
      //   this.socketService.sendMessage(userDTO.id, {
      //     type: SocketMessageType.PermissionChange,
      //   });
      //   return;
      // }

      // // 因为数组都是数字，所以先排序，排序之后把数组转换为字符串比较，写法比较简单
      // const sortOldRoleIds = oldRoleIds.sort();
      // const sortRoleIds = userDTO.roleIds.sort();

      // if (sortOldRoleIds.join() !== sortRoleIds.join()) {
      //   this.socketService.sendMessage(userDTO.id, {
      //     type: SocketMessageType.PermissionChange,
      //   });
      // }
    });

    const entity = this.userModel.findOneBy({ id });
    return omit(entity, ['password']) as UserVO;
  }
}
