import { APP_GUARD, Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { configModuleOptions } from '../core/config';
import { typeormModuleOptions } from '../core/typeorm';
import { gqlModuleOptions } from '../core/graphql';
import { mailerModuleOptions } from '../core/mailer';

import { UserModule } from '../modules/user';
import { AuthModule } from '../modules/auth';
import { GqlAuthGuard } from '../modules/auth';
import { PartyModule } from '../modules/party';
import { ImageModule } from '../modules/image';
import { NotificationModule } from 'src/modules/notification';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    MailerModule.forRootAsync(mailerModuleOptions),
    TypeOrmModule.forRootAsync(typeormModuleOptions),
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
