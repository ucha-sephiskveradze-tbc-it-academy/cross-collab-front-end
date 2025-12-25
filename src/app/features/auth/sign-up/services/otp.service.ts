import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.test';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private http = inject(HttpClient);
  private baseUrl = environment.authApiUrl;

  sendOtp(phoneNumber: string): Observable<void> {
    const params = new HttpParams().set('phoneNumber', phoneNumber);

    return this.http.post<void>(
      `${this.baseUrl}/users-auth/preregister`,
      null,          // ✅ NO BODY
      { params }     // ✅ QUERY PARAM
    );
  }
}
