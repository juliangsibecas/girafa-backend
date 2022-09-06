import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SupportMessage, SupportMessageSchema } from './schema';
import { SupportService } from './service';
import { SupportResolver } from './resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),
  ],
  providers: [SupportService, SupportResolver],
})
export class SupportModule {}
