import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@travelware/api-interfaces';
import {environment} from "../environments/environment";

@Component({
  selector: 'travelware-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  hello$ = this.http.get<Message>(`${environment.apiBaseUrl}/api/hello`);
  constructor(private http: HttpClient) {}
}
