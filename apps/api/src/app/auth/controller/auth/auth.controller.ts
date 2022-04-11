import {Body, Controller, Get, Post} from '@nestjs/common';
import {Public, Unprotected} from 'nest-keycloak-connect';
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../entity/user";
import {RegistrationRequest} from "../../model/registration-request";
import {map, mergeMap, switchMap} from "rxjs/operators";
import {Observable} from "rxjs";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {
  }

  @Post('register')
  @Unprotected()
  registerUser(@Body() body: RegistrationRequest): Observable<User> {
    return this.authService.getAdminToken().pipe(
      switchMap(token => this.authService.registerUser(token, body.firstName, body.lastName, body.email, body.password))
    );
  }
}
