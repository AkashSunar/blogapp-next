import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BlogModule } from './blog/blog.module';
import { UsersModule } from './users/users.module';
import { AuthsModule } from './auths/auths.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    BlogModule,
    UsersModule,
    AuthsModule,
    ConfigModule.forRoot(), // allows you to load environment variables and define a centralized configuration service that can be injected and used throughout your application.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
