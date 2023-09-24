import { Controller, Get, Post } from '@nestjs/common';
import { DefconService } from './defcon.service';

@Controller({
  path: 'api/defcon',
  version: '1',
})
export class DefconController {
  constructor(private readonly defconService: DefconService) {}

  @Post('update')
  async forceUpdate() {
    await this.defconService.updateAll();
    return {
      status: 'updated',
    };
  }

  @Get()
  getOverall() {
    return this.defconService.get('overall');
  }

  @Get('africa')
  getAfrica() {
    return this.defconService.get('africa');
  }

  @Get('mideast')
  getMideast() {
    return this.defconService.get('mideast');
  }

  @Get('cyber')
  getCyber() {
    return this.defconService.get('cyber');
  }

  @Get('europe')
  getEurope() {
    return this.defconService.get('europe');
  }

  @Get('asia')
  getAsia() {
    return this.defconService.get('asia');
  }

  @Get('usa')
  getUSA() {
    return this.defconService.get('usa');
  }

  @Get('latam')
  getLatam() {
    return this.defconService.get('latam');
  }

  @Get('space')
  getSpaceNuclear() {
    return this.defconService.get('space');
  }

  @Get('specops')
  getSpecOps() {
    return this.defconService.get('specops');
  }
}
