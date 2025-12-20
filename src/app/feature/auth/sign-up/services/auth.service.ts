import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateAccountDto } from '../models/create-account.dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  createAccount(payload: CreateAccountDto) {
    return this.http.post('/api/auth/signup', payload);
  }
}
