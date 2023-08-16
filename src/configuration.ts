import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as swagger from '@midwayjs/swagger';
import * as redis from '@midwayjs/redis';
import { join } from 'path';
import * as orm from '@midwayjs/typeorm';
// import * as i18n from '@midwayjs/i18n';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
// import { ReportMiddleware } from './middleware/report.middleware';
import { ValidateErrorFilter } from './filter/validate.filter';
import { CommonErrorFilter } from './filter/common.filter';
import * as captcha from '@midwayjs/captcha';
import { AuthMiddleware } from './middleware/auth';
@Configuration({
  imports: [
    koa,
    validate,
    orm,
    redis,
    // i18n,
    captcha,
    {
      component: swagger,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([AuthMiddleware]);
    // add filter
    this.app.useFilter([ValidateErrorFilter, CommonErrorFilter]);
  }
}
