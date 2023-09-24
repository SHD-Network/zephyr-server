import { Body, Controller, Get, Patch } from '@nestjs/common';
import { StatusService } from './status.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto';

@Controller({
  path: 'api/status',
  version: '1',
})
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('modules/enabled')
  async getEnabledModules() {
    return this.statusService.getEnabledModules();
  }

  @Get('version')
  async getStatus() {
    return this.statusService.getStatus();
  }

  @Get('update')
  async checkForUpdate() {
    return this.statusService.checkForUpdate();
  }

  @Patch('modules/update')
  async updateModule(@Body() updateModuleDto: UpdateModuleDto) {
    return this.statusService.updateModule(updateModuleDto);
  }

  @Get('account')
  async getAccountSettings() {
    return this.statusService.getAccountSettings();
  }

  @Patch('account')
  async updateAccountSettings(
    @Body() updateAccountSettingsDto: UpdateAccountSettingsDto,
  ) {
    return this.statusService.updateAccountSettings(updateAccountSettingsDto);
  }
}
