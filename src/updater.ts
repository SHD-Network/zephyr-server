import { PrismaService } from './prisma/prisma.service';
import { valid, gt } from 'semver';

type SystemData = {
  version: string;
};

async function updater() {
  const prisma = new PrismaService();
  const incomingVersion = process.env.npm_package_version;
  const system = await prisma.config.findUnique({
    where: {
      key: 'systemData',
    },
  });

  if (system === null) {
    // TODO This will execute when Zephyr is first installed
    const systemNew = await prisma.config.create({
      data: {
        key: 'systemData',
        value: {
          version: incomingVersion,
        },
      },
    });
  } else {
    // TODO This will execute when Zephyr has already been installed
    const systemData = system.value as SystemData;
    const installedVersion = systemData.version;

    if (installedVersion === undefined) {
      await prisma.config.update({
        where: {
          key: 'systemData',
        },
        data: {
          value: {
            version: incomingVersion,
          },
        },
      });
    } else {
      if (valid(installedVersion) && valid(incomingVersion)) {
        if (gt(incomingVersion, installedVersion)) {
          // TODO This will execute when Zephyr has already been installed and there is a new version
        }
      }
    }
  }
}

export default updater;
