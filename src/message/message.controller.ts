import { Controller, Get, Param, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { Request } from 'express';

@Controller({
  path: 'api/messages',
  version: '1',
})
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('list')
  async listMessages(@Req() req: Request) {
    const sessionId = req.session;
    return this.messageService.listMessages(sessionId);
  }

  @Get('search/:username')
  async findUser(@Req() req: Request, @Param('username') username: string) {
    const sessionId = req.session;
    console.log(sessionId);
    return this.messageService.findUser(username, sessionId);
  }
}
