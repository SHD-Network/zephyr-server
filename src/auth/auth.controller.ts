import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SigninUserPasskeyDto,
  SigninUserPasswordDto,
} from './dto/signin-user.dto';
import { VerifyUserPasskeyDto } from './dto/verify-user.dto';
import {
  SignupUserAddKeysDto,
  SignupUserPasskeyDto,
  SignupUserPasswordDto,
} from './dto/signup-user.dto';
import { Request, Response } from 'express';

@Controller({
  path: 'api/auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('available')
  async checkUsernameAvailability(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    if (username !== undefined) {
      const response = await this.authService.checkUsernameAvailability(
        username,
      );
      return response;
    }

    if (email !== undefined) {
      const response = await this.authService.checkEmailAvailability(email);
      return response;
    }

    return;
  }

  @Post('verify/passkey')
  async verifyUserWithPasskey(@Body() verifyUserDto: VerifyUserPasskeyDto) {
    const response = await this.authService.verifyUserWithPasskey(
      verifyUserDto,
    );
    return response;
  }

  @Post('signin/passkey')
  async signinWithPasskey(
    @Res({ passthrough: true }) res: Response,
    @Body() signinUserDto: SigninUserPasskeyDto,
  ) {
    const response = await this.authService.signinWithPasskey(signinUserDto);
    return response;
  }

  @Post('signin/password')
  async signinWithPassword(
    @Res({ passthrough: true }) res: Response,
    @Body() signinUserDto: SigninUserPasswordDto,
  ) {
    const response = await this.authService.signinWithPassword(signinUserDto);
    return response;
  }

  @Post('confirm')
  async confirm(@Req() req: Request) {
    const sessionId = req.session;
    const response = await this.authService.confirm(sessionId);
    return response;
  }

  @Get('methods')
  async authMethods(@Query('username') username: string) {
    const response = await this.authService.authMethods(username);
    return response;
  }

  @Delete('logout')
  async logout(@Req() req: Request) {
    const response = await this.authService.logout(req.session);
    return response;
  }

  @Post('signup/passkey')
  async signupWithPasskey(@Body() signupUserDto: SignupUserPasskeyDto) {
    return this.authService.signupWithPasskey(signupUserDto);
  }

  @Post('signup/password')
  async signupWithPassword(@Body() signupUserDto: SignupUserPasswordDto) {
    return this.authService.signupWithPassword(signupUserDto);
  }

  @Patch('keys')
  addKeys(@Body() addKeysDto: SignupUserAddKeysDto) {
    return this.authService.addKeys(addKeysDto);
  }
}
