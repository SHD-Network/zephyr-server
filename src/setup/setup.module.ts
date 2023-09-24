import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { PrismaModule } from '@zephyr/prisma/prisma.module';

@Module({
  controllers: [SetupController],
  providers: [SetupService],
  imports: [PrismaModule],
})
export class SetupModule {}
