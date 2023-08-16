import {
  Body,
  Controller,
  Inject,
  Post,
  Provide,
  ALL,
  Get,
} from '@midwayjs/decorator';
import { AuthService } from '../service/auth';
import { ApiResponse } from '@midwayjs/swagger';
import { TokenVO } from '../vo/token';
import { LoginDTO } from '../dto/login';
import { CaptchaService } from '../service/captcha';
import { R } from '../../../common/base.error.util';
import { RSAService } from '../../../common/rsa.service';
import { RedisService } from '@midwayjs/redis';
import { RefreshTokenDTO } from '../dto/refresh.token';

@Provide()
@Controller('/auth')
export class AuthController {
  @Inject()
  authService: AuthService;
  @Inject()
  captchaService: CaptchaService;
  @Inject()
  redisService: RedisService;
  @Inject()
  rsaService: RSAService;

  @Post('/login', { description: '登录' })
  @ApiResponse({ type: TokenVO })
  async login(@Body(ALL) loginDTO: LoginDTO) {
    const password = await this.rsaService.decrypt(
      loginDTO.publicKey,
      loginDTO.password
    );

    if (!password) {
      throw R.error('登录出现异常，请重新登录');
    }

    loginDTO.password = password;

    return await this.authService.login(loginDTO);
  }
  @Get('/captcha')
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.formula({
      height: 40,
      width: 120,
      noise: 1,
      color: true,
    });
    return {
      id,
      imageBase64,
    };
  }
  @Get('/publicKey')
  // @NotLogin()
  async getPublicKey() {
    return await this.rsaService.getPublicKey();
  }
  @Post('refresh/token', { description: '刷新token' })
  async refreshToken(@Body(ALL) token: RefreshTokenDTO) {
    return await this.authService.refreshToken(token);
  }
}
