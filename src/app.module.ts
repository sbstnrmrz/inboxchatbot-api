import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [
    AuthModule.forRoot({auth}),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
