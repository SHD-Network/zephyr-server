import { Controller, Get, Post, Body, Patch, Res, Req } from '@nestjs/common';
import { SetupService } from './setup.service';
import {
  CreateAdminUserAddKeysDto,
  CreateAdminUserPasskeyDto,
  CreateAdminUserPasswordDto,
} from './dto/create-admin-user.dto';
import { Request, Response } from 'express';

@Controller({
  path: 'api/setup',
  version: '1',
})
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post('user/passkey')
  createAdminUserPasskey(
    @Body() createAdminUserDto: CreateAdminUserPasskeyDto,
  ) {
    return this.setupService.createAdminUserPasskey(createAdminUserDto);
  }

  @Post('user/password')
  createAdminUserPassword(
    @Body() createAdminUserDto: CreateAdminUserPasswordDto,
  ) {
    return this.setupService.createAdminUserPassword(createAdminUserDto);
  }

  @Get('status')
  getStatus(@Req() req: Request) {
    const sessionId = req.session;
    return this.setupService.getStatus(sessionId);
  }

  @Patch('user/keys')
  addKeys(@Body() addKeysDto: CreateAdminUserAddKeysDto) {
    return this.setupService.addKeys(addKeysDto);
  }
}
