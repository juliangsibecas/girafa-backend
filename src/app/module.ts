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

import { UserModule } from '../modules/user';
import { AuthModule } from '../modules/auth';
import { GqlAuthGuard } from '../modules/auth';
import { PartyModule } from '../modules/party';
import { ImageModule } from '../modules/image';
import { NotificationModule } from 'src/modules/notification';
import { mongooseModuleOptions } from 'src/core/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    MailerModule.forRootAsync(mailerModuleOptions),
    MongooseModule.forRootAsync(mongooseModuleOptions),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot(gqlModuleOptions),
    AuthModule,
    ImageModule,
    NotificationModule,
    UserModule,
    PartyModule,
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
