import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { omit } from 'lodash';
import { BaseEntity } from './base.entity';

export class BaseDTO<T extends BaseEntity> {
  @ApiProperty()
  @Rule(RuleType.allow(null))
  id: number;
  toEntity(): T {
    return omit(this, ['createDate', 'updateDate']) as unknown as T;
  }
}
