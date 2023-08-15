import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../../../common/base.service';
import { UserEntity } from '../entity/user';
import { UserVO } from '../vo/user';

import { R } from '../../../common/base.error.util';
import { omit } from 'lodash';

@Provide()
export class UserService extends BaseService<UserEntity> {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  getModel(): Repository<UserEntity> {
    return this.userModel;
  }
  async create(entity: UserEntity): Promise<UserVO> {
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

    console.log('entity', entity);
    await this.userModel.save(entity);
    return omit(entity, ['password']) as UserVO;
  }
  async edit(entity: UserEntity): Promise<void | UserVO> {
    const { userName, phoneNumber, email, id } = entity;
    let user = await this.userModel.findOneBy({ userName });

    if (user && user.id !== id) {
      throw R.error('当前用户名已存在');
    }

    user = await this.userModel.findOneBy({ phoneNumber });

    if (user && user.id !== id) {
      throw R.error('当前手机号已存在');
    }

    user = await this.userModel.findOneBy({ email });

    if (user && user.id !== id) {
      throw R.error('当前邮箱已存在');
    }

    await this.userModel.save(entity);

    return omit(entity, ['password']) as UserVO;
  }
}
