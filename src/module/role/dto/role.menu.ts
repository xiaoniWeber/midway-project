import { Rule, RuleType } from '@midwayjs/validate';
import { R } from '../../../common/base.error.util';
import { requiredNumber } from '../../../common/common.validate.rules';

export class RoleMenuDTO {
  @Rule(requiredNumber.error(R.validateError('角色id不能为空')))
  roleId?: number;
  @Rule(RuleType.array().items(RuleType.number()))
  menuIds?: number[];
}
