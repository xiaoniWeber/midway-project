/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}
interface UserContext {
  userId: number;
  refreshToken: string;
}

declare module '@midwayjs/core' {
  interface Context {
    userInfo: UserContext;
    token: string;
  }
}
