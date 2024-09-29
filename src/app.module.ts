import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
// import { MongooseModule } from '@nestjs/mongoose'
import { LoggerMiddleware } from './infrastructure/middlewares/logger.middleware'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { MailerModule } from '@nestjs-modules/mailer'
import { DecodeUserIdMiddleware } from './infrastructure/middlewares/user-id .middleware'
import { CqrsModule } from '@nestjs/cqrs'
import configuration, { Configuration, validate } from './settings/configuration'
import process from 'process'
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { EmailModule } from './infrastructure/emails/email.module'
import { UsersModule } from './features/users/users.module'
import { AuthModule } from './features/auth/auth.module'
import { SessionsModule } from './features/sessions/sessions.module'
import { BlogsModule } from './features/blogs/blogs.module'
import { TestingModule } from './features/testing/testing.module'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    CqrsModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 1000,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.development'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<Configuration, true>) => {
        const { SQL_USER_NAME, SQL_PASSWORD, SQL_DATABASE_NAME } = configService.get('sqlDatabaseSettings', {
          infer: true,
        })

        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: SQL_USER_NAME,
          password: SQL_PASSWORD,
          database: SQL_DATABASE_NAME,
          autoLoadEntities: true,
          logging: ['query'],
          // synchronize: true,
          synchronize: false,
        }
      },
      inject: [ConfigService],
    }),
    // MongooseModule.forRootAsync({
    //   useFactory: (configService: ConfigService<Configuration, true>) => {
    //     const environmentSettings = configService.get('environmentSettings', {
    //       infer: true,
    //     })
    //     const databaseSettings = configService.get('databaseSettings', {
    //       infer: true,
    //     })
    //
    //     const uri = environmentSettings.isTesting ? databaseSettings.MONGO_TEST_URI : databaseSettings.MONGO_URI
    //
    //     return {
    //       uri,
    //     }
    //   },
    //   inject: [ConfigService],
    // }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<Configuration, true>) => {
        const { EMAIL_USER, EMAIL_PASSWORD } = configService.get('emailSettings', { infer: true })

        return {
          transport: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            ignoreTLS: true,
            secure: true,
            auth: {
              user: EMAIL_USER,
              pass: EMAIL_PASSWORD,
            },
          },
          defaults: {
            from: `"Andrew" <${EMAIL_USER}>`,
          },
          template: {
            dir: process.cwd() + '/src/features/emails/templates',
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    SessionsModule,
    UsersModule,
    EmailModule,
    BlogsModule,
    TestingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*').apply(DecodeUserIdMiddleware).forRoutes('*')
  }
}
