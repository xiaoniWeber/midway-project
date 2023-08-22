import { RoleEntity } from '../entity/role';
import { PickVO } from '../../../utils/vo.utils';

// eslint-disable-next-line prettier/prettier
export class RoleVO extends PickVO(RoleEntity, []) {}
