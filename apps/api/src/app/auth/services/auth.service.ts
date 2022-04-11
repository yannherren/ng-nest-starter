import {HttpService, Injectable} from '@nestjs/common';
import {catchError, flatMap, Observable, of, switchMap} from 'rxjs';
import {exhaustMap, map, mergeMap} from 'rxjs/operators';
import {Token} from "../model/token";
import {UserService} from "./user.service";
import {User} from "../entity/user";
import {DuplicatedUserException} from "../exception/duplicated-user-exception";
import {UserCreationFailure} from "../exception/user-creation-failure";

@Injectable()
export class AuthService {

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService
  ) {
  }

  getAdminToken(): Observable<Token> {
    const kcUrl = process.env.KEYCLOAK_URL + process.env.KC_TOKEN_PATH;
    const formData = new URLSearchParams();
    formData.append('client_id', process.env.KC_ADMIN_CLIENT_ID);
    formData.append('grant_type', 'client_credentials');
    formData.append('client_secret', process.env.KC_ADMIN_CLIENT_SECRET);

    return this.httpService.post<Token>(kcUrl, formData).pipe(
      map(result => {
        return {
          accessToken: result.data['access_token']
        }
      })
    );
  }

  createUser(token: Token, firstName: string, lastName, email: string): Observable<boolean> {
    const headerData = {
      'Authorization': `Bearer ${token.accessToken}`
    }

    const requestBody = {
      firstName,
      lastName,
      email,
      username: email,
      enabled: true
    }
    return this.httpService.post<void>(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
      requestBody,
      {
        headers: headerData
      }
    ).pipe(
      map(result => {
          return result.status === 201
        }
      ),
      catchError(err => {
        throw new DuplicatedUserException('User creating failed');
      })
    );
  }

  registerUser(token: Token, firstName: string, lastName, email: string, password: string): Observable<User> {
    return this.createUser(token, firstName, lastName, email).pipe(
      switchMap(created => {
        return this.resetPasswordByEmail(token, email, password);
      }),
      map(created => {
        if (created) {
          this.sendVerificationEmail(token, email).subscribe(() => console.log());
          return this.userService.createUser(firstName, lastName, email);
        }

        throw new UserCreationFailure('User creating failed');
      }),
      catchError(err => {
        console.log(err)

        throw new UserCreationFailure('User creating failed');
      })
    );
  }

  getKeycloakUserUuidByEmail(token: Token, email: string): Observable<string> {
    const headerData = {
      'Authorization': `Bearer ${token.accessToken}`
    }

    return this.httpService.get(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
      {
        headers: headerData,
        params: {
          email
        }
      }
    ).pipe(
      map(result => {
        return result.data[0]['id'];
      })
    );
  }

  resetPasswordByEmail(token: Token, email: string, password: string): Observable<boolean> {
    return this.getKeycloakUserUuidByEmail(token, email).pipe(
      switchMap(uuid => {
        const headerData = {
          'Authorization': `Bearer ${token.accessToken}`
        }

        const body = {
          type: 'password',
          temporary: false,
          value: password
        }

        return this.httpService.put(
          `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${uuid}/reset-password`,
          body,
          {
            headers: headerData,
          }
        ).pipe(
          map(result => {
            return result.status === 204
          })
        )
      }))
  }

  sendVerificationEmail(token: Token, email: string): Observable<boolean> {
    return this.getKeycloakUserUuidByEmail(token, email).pipe(
      switchMap(uuid => {
        const headerData = {
          'Authorization': `Bearer ${token.accessToken}`
        }

        return this.httpService.put<void>(
          `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${uuid}/send-verify-email`,
          {},
          {headers: headerData}
        ).pipe(
          map(result => result.status === 204),
          catchError(err => {
            return of(false);
          })
        )
      }
    ))
  }
}
