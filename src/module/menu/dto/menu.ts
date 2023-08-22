import { Rule } from '@midwayjs/validate';
import { R } from '../../../common/base.error.util';
import { MenuEntity } from '../entity/menu';
import {
  bool,
  requiredString,
  string,
  requiredNumber,
  number,
} from '../../../common/common.validate.rules';
import { BaseDTO } from '../../../common/base.dto';

export class MenuDTO extends BaseDTO<MenuEntity> {
  @Rule(number.allow(null))
  parentId?: number;
  @Rule(requiredString.error(R.validateError('名称不能为空')))
  name?: string;
  @Rule(string.allow(null))
  icon?: string;
  @Rule(requiredNumber.error(R.validateError('类型不能为空')))
  type?: number;
  @Rule(string.allow(null))
  route?: string;
  @Rule(string.allow(null))
  filePath?: string;
  @Rule(number.allow(null))
  orderNumber?: number;
  @Rule(string.allow(null))
  url?: string;
  @Rule(bool.allow(null))
  show?: boolean;
  @Rule(string.allow(null))
  authCode?: string;
}
