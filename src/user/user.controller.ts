import { Controller, Get, Body, Patch, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AddPasswordDto } from './dto/add-password.dto';
import { Request } from 'express';

@Controller({
  path: 'api/user',
  version: '1',
})
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  listAllUsers() {
    return this.userService.listAllUsers();
  }

  @Get('username/:username/publicKey')
  publicKeyFromUsername(@Param('username') username: string) {
    return this.userService.fetchPublicKey('username', username);
  }

  @Get('id/:id/publicKey')
  publicKeyFromUserId(@Param('id') id: string) {
    return this.userService.fetchPublicKey('id', id);
  }

  @Get('hasPassword')
  hasPassword(@Req() req: Request) {
    const sessionId = req.session;
    return this.userService.hasPassword(sessionId);
  }

  @Get('hasPasskey')
  hasPasskey(@Req() req: Request) {
    const sessionId = req.session;
    return this.userService.hasPasskey(sessionId);
  }

  @Patch('addPassword')
  addPasswordToAccount(
    @Req() req: Request,
    @Body() addPasswordDto: AddPasswordDto,
  ) {
    const sessionId = req.session;
    return this.userService.addPassword(sessionId, addPasswordDto.password);
  }

  @Get('sessions')
  getSessions(@Req() req: Request) {
    const sessionId = req.session;
    return this.userService.getSessions(sessionId);
  }

  @Get('me')
  getPermissions(@Req() req: Request) {
    const sessionId = req.session;
    return this.userService.get(sessionId);
  }

  @Get('uid/:id')
  getUserById(@Param('id') id: string) {
    return this.userService.getById(id);
  }
}
