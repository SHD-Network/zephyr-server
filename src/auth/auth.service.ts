import { Injectable } from '@nestjs/common';
import { PrismaService } from '@zephyr/prisma/prisma.service';
import {
  SigninUserPasskeyDto,
  SigninUserPasswordDto,
} from './dto/signin-user.dto';
import {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  binaryToBase64Url,
  clean,
  hashPassword,
  stringToArrayBuffer,
} from '@zephyr/setup/setup.service';
import { ConfirmIdentityDto } from './dto/confirm-identity.dto';
import { VerifyUserPasskeyDto } from './dto/verify-user.dto';
import {
  SignupUserAddKeysDto,
  SignupUserPasskeyDto,
  SignupUserPasswordDto,
} from './dto/signup-user.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getUserFromSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    return user;
  }

  async confirmIdentity(confirmIdentityDto: ConfirmIdentityDto) {
    const userCredential = await this.prisma.credential.findUnique({
      select: {
        id: true,
        userId: true,
        externalId: true,
        publicKey: true,
        signCount: true,
        user: {
          select: {
            id: true,
          },
        },
      },
      where: {
        externalId: confirmIdentityDto.credential.id,
      },
    });

    if (userCredential === null) {
      throw new Error('Unknown user');
    }

    let verification: VerifiedAuthenticationResponse;

    try {
      verification = await verifyAuthenticationResponse({
        response: confirmIdentityDto.credential as any,
        expectedChallenge: confirmIdentityDto.challenge,
        authenticator: {
          credentialID: userCredential.externalId as any,
          credentialPublicKey: userCredential.publicKey,
          counter: userCredential.signCount,
        },
        expectedOrigin: process.env.APP_URL ?? 'http://localhost:3000',
        expectedRPID:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.NODE_ENV === 'test'
            ? 'localhost'
            : process.env.RPID ?? 'shd.network',
      });

      await this.prisma.credential.update({
        data: {
          signCount: verification.authenticationInfo.newCounter,
        },
        where: {
          id: userCredential.id,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (
      !verification.verified ||
      confirmIdentityDto.id.toLowerCase() !==
        userCredential.user.id.toLowerCase()
    ) {
      throw new Error('Invalid Credentials');
    }

    return {
      ...userCredential.user,
      challenge: confirmIdentityDto.challenge,
    };
  }

  async signinWithPasskey(signinUserDto: SigninUserPasskeyDto) {
    const userCredential = await this.prisma.credential.findUnique({
      select: {
        id: true,
        userId: true,
        externalId: true,
        publicKey: true,
        signCount: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
      where: {
        externalId: signinUserDto.credential.id,
      },
    });

    if (userCredential === null) {
      throw new Error('Unknown User');
    }

    let verification: VerifiedAuthenticationResponse;

    try {
      verification = await verifyAuthenticationResponse({
        response: signinUserDto.credential as any,
        expectedChallenge: signinUserDto.challenge,
        authenticator: {
          credentialID: userCredential.externalId as any,
          credentialPublicKey: userCredential.publicKey,
          counter: userCredential.signCount,
        },
        expectedOrigin: process.env.APP_URL ?? 'http://localhost:3000',
        expectedRPID:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.NODE_ENV === 'test'
            ? 'localhost'
            : process.env.RPID ?? 'shd.network',
      });

      await this.prisma.credential.update({
        data: {
          signCount: verification.authenticationInfo.newCounter,
        },
        where: {
          id: userCredential.id,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (
      !verification.verified ||
      signinUserDto.username.toLowerCase() !==
        userCredential.user.username.toLowerCase()
    ) {
      throw new Error('Invalid Credentials');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: userCredential.user.id,
      },
    });

    return {
      ...userCredential.user,
      challenge: signinUserDto.challenge,
      zsn: session.id,
    };
  }

  async signinWithPassword(signinUserDto: SigninUserPasswordDto) {
    const user = await this.prisma.user.findUnique({
      select: {
        username: true,
        id: true,
        password: {
          select: {
            password: true,
            salt: true,
          },
        },
      },
      where: {
        username: signinUserDto.username,
      },
    });

    if (user === null) {
      throw new Error('Unknown User');
    }

    const hashedPassword = await hashPassword(
      signinUserDto.password,
      user.password.salt,
    );

    if (hashedPassword.password === user.password.password) {
      const { password, ...returnData } = user;

      const session = await this.prisma.session.create({
        data: {
          userId: user.id,
        },
      });

      return {
        ...returnData,
        zsn: session.id,
      };
    } else {
      throw new Error('Invalid Credentials');
    }
  }

  async checkUsernameAvailability(username: string) {
    const users = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (users === null) {
      return {
        available: true,
      };
    }

    return {
      available: false,
    };
  }

  async checkEmailAvailability(email: string) {
    const users = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (users === null) {
      return {
        available: true,
      };
    }

    return {
      available: false,
    };
  }

  async confirm(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (session === null) {
      return {
        authenticated: false,
      };
    }

    return {
      authenticated: true,
    };
  }

  async verifyUserWithPasskey(verifyUserDto: VerifyUserPasskeyDto) {
    const userCredential = await this.prisma.credential.findUnique({
      select: {
        id: true,
        userId: true,
        externalId: true,
        publicKey: true,
        signCount: true,
        user: {
          select: {
            id: true,
          },
        },
      },
      where: {
        externalId: verifyUserDto.credential.id,
      },
    });

    if (userCredential === null) {
      throw new Error('Unknown User');
    }

    let verification: VerifiedAuthenticationResponse;

    try {
      verification = await verifyAuthenticationResponse({
        response: verifyUserDto.credential as any,
        expectedChallenge: verifyUserDto.challenge,
        authenticator: {
          credentialID: userCredential.externalId as any,
          credentialPublicKey: userCredential.publicKey,
          counter: userCredential.signCount,
        },
        expectedOrigin: process.env.APP_URL ?? 'http://localhost:3000',
        expectedRPID:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.NODE_ENV === 'test'
            ? 'localhost'
            : process.env.RPID ?? 'shd.network',
      });

      await this.prisma.credential.update({
        data: {
          signCount: verification.authenticationInfo.newCounter,
        },
        where: {
          id: userCredential.id,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (
      !verification.verified ||
      verifyUserDto.userId !== userCredential.user.id
    ) {
      throw new Error('Invalid Credentials');
    }

    return {
      ...userCredential.user,
      challenge: verifyUserDto.challenge,
    };
  }

  async authMethods(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        password: true,
        credentials: true,
      },
    });

    if (user === null) {
      return {
        password: null,
        passkey: null,
      };
    }

    return {
      password: user?.password !== null,
      passkey: user?.credentials.length > 0,
    };
  }

  async logout(sessionId: string) {
    await this.prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    return {
      loggedOut: true,
    };
  }

  async signupWithPasskey(signupUserDto: SignupUserPasskeyDto) {
    let verification: VerifiedRegistrationResponse;

    if (signupUserDto.credential === null) {
      throw new Error('Invalid Credentials');
    }

    try {
      verification = await verifyRegistrationResponse({
        response: signupUserDto.credential as any,
        expectedChallenge: signupUserDto.challenge,
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
        email: signupUserDto.email,
        username: signupUserDto.username,
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

    return {
      ...user,
      challenge: signupUserDto.challenge,
      zsn: session.id,
    };
  }

  async signupWithPassword(signupUserDto: SignupUserPasswordDto) {
    const hashedPassword = await hashPassword(signupUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        email: signupUserDto.email,
        username: signupUserDto.username,
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

    return {
      ...user,
      zsn: session.id,
    };
  }

  async addKeys(addKeysDto: SignupUserAddKeysDto) {
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
}
