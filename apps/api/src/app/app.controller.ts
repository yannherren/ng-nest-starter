import { Controller, Get } from '@nestjs/common';

import { Message } from '@travelware/api-interfaces';

import { AppService } from './app.service';
import {Public, Roles} from "nest-keycloak-connect";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @Roles({roles: ['admin']})
  //@Public()
  getData(): Message {
    return this.appService.getData();
  }
}
