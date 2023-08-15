import { UserEntity } from '../entity/user';
import { PickVO } from '../../../utils/vo.utils';

// eslint-disable-next-line prettier/prettier
export class UserVO extends PickVO(UserEntity, []) {}
