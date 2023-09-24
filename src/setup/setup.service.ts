import { Injectable } from '@nestjs/common';
import {
  CreateAdminUserAddKeysDto,
  CreateAdminUserPasskeyDto,
  CreateAdminUserPasswordDto,
} from './dto/create-admin-user.dto';
import { PrismaService } from '@zephyr/prisma/prisma.service';
import {
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { User } from '@prisma/client';
import { pbkdf2, randomBytes } from 'crypto';
import { Response } from 'express';

type PasswordType = {
  password: string;
  salt: string;
  iterations: number;
  keyLen: number;
  digest: string;
};

export function binaryToBase64Url(bytes: Uint8Array) {
  let str = '';

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

export function clean(str: string) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function stringToArrayBuffer(keyString: string) {
  const buffer = new ArrayBuffer(keyString.length);
  const bufferView = new Uint8Array(buffer);

  for (let i = 0; i < keyString.length; i++) {
    bufferView[i] = keyString.charCodeAt(i);
  }

  return buffer;
}

export function hashPassword(password: string, salt?: string) {
  return new Promise<PasswordType>((resolve, reject) => {
    const userSalt = salt ?? randomBytes(128).toString('base64');
    const iterations = 10000;
    const keyLen = 64;
    const digest = 'sha512';

    pbkdf2(password, userSalt, iterations, keyLen, digest, (err, key) => {
      if (err) {
        reject(err);
      }

      resolve({
        password: key.toString('hex'),
        salt: userSalt,
        iterations,
        keyLen,
        digest,
      });
    });
  });
}

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  private async createDatabase(adminUser: User) {
    // Create the config for enabled modules & account settings
    await this.prisma.config.createMany({
      data: [
        {
          key: 'enabledModules',
          value: {
            news: false,
            messages: false,
            calendar: false,
            mail: false,
            inventory: false,
            documents: false,
            crops: false,
            defcon: false,
            pricing: false,
            wiki: false,
            home_monitoring: false,
            security: false,
          },
        },
        {
          key: 'accountSettings',
          value: {
            allowRegistration: false,
            allowInvite: false,
          },
        },
      ],
    });

    // Create the permission nodes
    const adminNode = await this.prisma.rolePermissions.create({
      data: {
        node: '*',
        description: 'Grant user administrator access, all permissions',
      },
    });

    // Create the admin role
    const adminRole = await this.prisma.userRole.create({
      data: {
        name: 'Admin',
      },
    });

    // Assign admin role all permissions
    await this.prisma.userRole.update({
      where: {
        id: adminRole.id,
      },
      data: {
        users: {
          connect: {
            id: adminUser.id,
          },
        },
        permissions: {
          connectOrCreate: [
            {
              create: adminNode,
              where: {
                id: adminNode.id,
              },
            },
          ],
        },
      },
    });
  }

  async createAdminUserPasskey(createAdminUserDto: CreateAdminUserPasskeyDto) {
    let verification: VerifiedRegistrationResponse;

    if (createAdminUserDto.credential === null) {
      throw new Error('Invalid Credentials');
    }

    try {
      verification = await verifyRegistrationResponse({
        response: createAdminUserDto.credential as any,
        expectedChallenge: createAdminUserDto.challenge,
        requireUserVerification: true,
        expectedOrigin: process.env.APP_URL ?? 'http://localhost:3000',
        expectedRPID:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.NODE_ENV === 'test'
            ? 'localhost'
            : process.env.RPID ?? 'shd.network',
      });
    } catch (error) {
      throw error;
    }

    if (!verification.verified) {
      throw new Error('Registration verification failed');
    }

    const { credentialID, credentialPublicKey } =
      verification.registrationInfo ?? {};

    if (credentialID === undefined || credentialPublicKey === undefined) {
      throw new Error('Registration failed');
    }

    const user = await this.prisma.user.create({
      data: {
        email: createAdminUserDto.email,
        username: createAdminUserDto.username,
        credentials: {
          create: {
            externalId: clean(binaryToBase64Url(credentialID)),
            publicKey: Buffer.from(credentialPublicKey),
          },
        },
      },
    });

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
      },
    });

    await this.createDatabase(user);

    return {
      ...user,
      challenge: createAdminUserDto.challenge,
      zsn: session.id,
    };
  }

  async createAdminUserPassword(
    createAdminUserDto: CreateAdminUserPasswordDto,
  ) {
    const hashedPassword = await hashPassword(createAdminUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: createAdminUserDto.email,
        username: createAdminUserDto.username,
        password: {
          create: {
            password: hashedPassword.password,
            salt: hashedPassword.salt,
          },
        },
      },
    });

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
      },
    });

    await this.createDatabase(user);

    return {
      ...user,
      zsn: session.id,
    };
  }

  async addKeys(addKeysDto: CreateAdminUserAddKeysDto) {
    const arrayBuffer = stringToArrayBuffer(addKeysDto.bundle);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: addKeysDto.userId,
      },
      data: {
        publicKey: {
          create: {
            keyValue: Buffer.from(arrayBuffer),
          },
        },
      },
    });

    return {
      ...updatedUser,
    };
  }

  async getStatus(sessionId?: string) {
    const totalUsers = await this.prisma.user.count();
    let loggedIn = false;

    if (totalUsers < 1) {
      return {
        adminUser: false,
      };
    }

    if (sessionId !== undefined) {
      const session = await this.prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: session.userId,
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (user !== null) {
        loggedIn = true;
      }
    }

    return {
      adminUser: true,
      loggedIn,
    };
  }
}
