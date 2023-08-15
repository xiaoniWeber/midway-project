import { MidwayConfig } from '@midwayjs/core';
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1691650921088_3250',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        /**
         * 单数据库实例
         */
        type: 'mysql',
        host: 'localhost', // 数据库ip地址，本地就写localhost
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'test', // 数据库名称
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: false,
        // 扫描entity文件夹
        entities: ['**/entity/*{.ts,.js}'],
        // entities: [Photo],
      },
    },
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: 'localhost', // Redis host
      password: '123456',
      db: 0,
    },
  },
  i18n: {
    localeTable: {
      en_US: require('../locales/zh_CN'),
      zh_CN: require('../locales/en_US'),
    },
  },
} as MidwayConfig;
