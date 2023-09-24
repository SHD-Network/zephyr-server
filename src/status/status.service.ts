import { Injectable } from '@nestjs/common';
import { PrismaService } from '@zephyr/prisma/prisma.service';
import { valid, gt } from 'semver';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto';

type SystemData = {
  version: string;
};

type GitHubReleases = {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  tarball_url: string;
  zipball_url: string;
  body: string;
};

type UpdateDetails = {
  name: string;
  body: string;
  releaseDate: string;
};

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  async getEnabledModules() {
    const enabledModules = await this.prisma.config.findUnique({
      where: {
        key: 'enabledModules',
      },
    });

    if (enabledModules === null) {
      return false;
    }

    return enabledModules.value;
  }

  async getStatus() {
    const systemData = await this.prisma.config.findUnique({
      where: {
        key: 'systemData',
      },
    });

    if (systemData === null) {
      return false;
    }

    return systemData.value;
  }

  async checkForUpdate() {
    const systemData = await this.prisma.config.findUnique({
      where: {
        key: 'systemData',
      },
    });

    if (systemData === null) {
      return false;
    }

    const currentVersion = systemData.value as SystemData;

    const githubResponse = await fetch(
      'https://api.github.com/repos/nestjs/swagger/releases/latest',
    );
    const latestVersion: GitHubReleases = await githubResponse.json();
    let hasUpdate = false;
    let updateDetails: UpdateDetails | null = null;

    if (valid(currentVersion.version) === null) {
      return false;
    }

    if (valid(latestVersion.tag_name) === null) {
      return false;
    }

    if (gt(latestVersion.tag_name, currentVersion.version)) {
      hasUpdate = true;
      updateDetails = {
        name: latestVersion.name,
        body: latestVersion.body,
        releaseDate: latestVersion.published_at,
      };
    }

    return {
      currentVersion: currentVersion.version,
      latestVersion: latestVersion.tag_name,
      hasUpdate,
      updateDetails,
    };
  }

  async updateModule(updateModuleDto: UpdateModuleDto) {
    const currentModules = await this.prisma.config.findUnique({
      where: {
        key: 'enabledModules',
      },
    });

    currentModules.value[updateModuleDto.module] = updateModuleDto.status;

    const updatedModules = await this.prisma.config.update({
      where: {
        key: 'enabledModules',
      },
      data: {
        value: currentModules.value,
      },
    });

    return updatedModules.value;
  }

  async getAccountSettings() {
    const accountSettings = await this.prisma.config.findUnique({
      where: {
        key: 'accountSettings',
      },
    });

    return accountSettings.value;
  }

  async updateAccountSettings(
    updateAccountSettingsDto: UpdateAccountSettingsDto,
  ) {
    const currentSettings = await this.prisma.config.findUnique({
      where: {
        key: 'accountSettings',
      },
    });

    currentSettings.value[updateAccountSettingsDto.setting] =
      updateAccountSettingsDto.value;

    const updatedSettings = await this.prisma.config.update({
      where: {
        key: 'accountSettings',
      },
      data: {
        value: currentSettings.value,
      },
    });

    return updatedSettings.value;
  }
}
