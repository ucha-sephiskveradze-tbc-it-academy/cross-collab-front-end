import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateAccountDto } from '../models/create-account.dto';
import { environment } from '../../../../../environments/environment.test';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  createAccount(dto: CreateAccountDto) {
    console.log(dto);
    return this.http.post(`${environment.apiUrl}/users`, dto);
  }
}
