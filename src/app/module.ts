import { APP_GUARD, Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { configModuleOptions } from '../core/config';
import { gqlModuleOptions } from '../core/graphql';
import { mailerModuleOptions } from '../core/mailer';
import { mongooseModuleOptions } from '../core/mongoose';

import { UserModule } from '../modules/user';
import { AuthModule } from '../modules/auth';
import { GqlAuthGuard } from '../modules/auth';
import { PartyModule } from '../modules/party';
import { ImageModule } from '../modules/image';
import { NotificationModule } from '../modules/notification';
import { SupportModule } from '../modules/support';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    MailerModule.forRootAsync(mailerModuleOptions),
    MongooseModule.forRootAsync(mongooseModuleOptions),
    GraphQLModule.forRootAsync(gqlModuleOptions),
    ScheduleModule.forRoot(),

    AuthModule,
    ImageModule,
    NotificationModule,
    UserModule,
    PartyModule,
    SupportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (ref) => new GqlAuthGuard(ref),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
