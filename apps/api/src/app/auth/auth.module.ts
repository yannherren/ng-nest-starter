import {HttpModule, HttpService, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "./entity/user";
import { UserService } from './services/user.service';
import { AuthController } from './controller/auth/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HttpModule
  ],
  providers: [UserService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
