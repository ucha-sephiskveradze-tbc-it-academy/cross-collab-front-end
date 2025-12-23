import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.test';

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  oneTimePassword: string;
  department: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.authApiUrl;

  createAccount(payload: RegisterRequest): Observable<void> {
    console.log('📡 POST /register payload:', payload);

    return this.http.post<void>(
      `${this.baseUrl}/users-auth/register`,
      payload
    );
  }
}
