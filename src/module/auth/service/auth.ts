import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { UserEntity } from '../../user/entity/user';
import { R } from '../../../common/base.error.util';
import { LoginDTO } from '../dto/login';
import { TokenVO } from '../vo/token';
import { TokenConfig } from '../../../interface/token.config';
import { RedisService } from '@midwayjs/redis';

import { CaptchaService } from './captcha';
import { uuid } from '../../../utils/uuid';
import { RefreshTokenDTO } from '../dto/refresh.token';

@Provide()
export class AuthService {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;
  @Inject()
  captchaService: CaptchaService;
  @Config('token')
  tokenConfig: TokenConfig;
  @Inject()
  redisService: RedisService;

  async login(loginDTO: LoginDTO): Promise<TokenVO> {
    try {
      const { accountNumber } = loginDTO;

      const user = await this.userModel
        .createQueryBuilder('user')
        .where('user.phoneNumber = :accountNumber', {
          accountNumber,
        })
        .orWhere('user.username = :accountNumber', { accountNumber })
        .orWhere('user.email = :accountNumber', { accountNumber })
        .select(['user.password', 'user.id', 'user.userName'])
        .getOne();

      if (!user) {
        throw R.error('账号或密码错误！');
      }

      console.log(bcrypt.compareSync(loginDTO.password, user.password));
      if (!bcrypt.compareSync(loginDTO.password, user.password)) {
        throw R.error('用户名或密码错误！');
      }

      const { expire, refreshExpire } = this.tokenConfig;

      const token = uuid();
      const refreshToken = uuid();

      // multi可以实现redis指令并发执行
      await this.redisService
        .multi()
        .set(
          `token:${token}`,
          JSON.stringify({ userId: user.id, refreshToken })
        )
        .expire(`token:${token}`, expire)
        .set(`refreshToken:${refreshToken}`, user.id)
        .expire(`refreshToken:${refreshToken}`, refreshExpire)
        .sadd(`userToken_${user.id}`, token)
        .sadd(`userRefreshToken_${user.id}`, refreshToken)
        .exec();

      const { captcha, captchaId } = loginDTO;

      const result = await this.captchaService.check(captchaId, captcha);

      if (!result) {
        throw R.error('验证码错误');
      }

      // loginLog.status = true;
      // loginLog.message = '成功';

      return {
        expire,
        token,
        refreshExpire,
        refreshToken,
      } as TokenVO;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      // this.loginLogModel.save(loginLog);
    }
  }
  async refreshToken(refreshToken: RefreshTokenDTO): Promise<TokenVO> {
    const userId = await this.redisService.get(
      `refreshToken:${refreshToken.refreshToken}`
    );

    if (!userId) {
      throw R.error('刷新token失败');
    }

    const { expire } = this.tokenConfig;

    const token = uuid();

    await this.redisService
      .multi()
      .set(`token:${token}`, userId)
      .expire(`token:${token}`, expire)
      .exec();

    const refreshExpire = await this.redisService.ttl(
      `refreshToken:${refreshToken.refreshToken}`
    );

    return {
      expire,
      token,
      refreshExpire,
      refreshToken: refreshToken.refreshToken,
    } as TokenVO;
  }
  async getUserById(userId: number) {
    const entity = await this.userModel
      .createQueryBuilder('t')
      // .leftJoinAndSelect(UserRoleEntity, 'user_role', 't.id = user_role.userId')
      // .leftJoinAndMapOne(
      //   't.avatarEntity',
      //   // FileEntity,
      //   'file',
      //   'file.pkValue = t.id and file.pkName = "user_avatar"'
      // )
      // .leftJoinAndMapMany(
      //   't.roles',
      //   RoleEntity,
      //   'role',
      //   'role.id = user_role.roleId'
      // )
      .where('t.id = :id', { id: userId })
      .getOne();

    if (!entity) {
      throw R.error('当前用户不存在！');
    }

    // 先把用户分配的角色查出来
    // const userRoles = await this.userRoleModel.findBy({ userId: userId });
    // // 根据已分配角色查询已分配的菜单id数组
    // const roleMenus = await this.roleMenuModel.find({
    //   where: { roleId: In(userRoles.map(userRole => userRole.roleId)) },
    // });
    // // 根据菜单id数组查询菜单信息，这里加了个特殊判断，如果是管理员直接返回全部菜单，正常这个应该走数据迁移，数据迁移还没做，就先用这种方案。
    // const query = { id: In(roleMenus.map(roleMenu => roleMenu.menuId)) };
    // const menus = await this.menuModel.find({
    //   where: userId === '1' ? {} : query,
    //   order: { orderNumber: 'ASC', createDate: 'DESC' },
    // });

    return {
      ...entity.toVO(),
      // menus,
    };
  }
}
