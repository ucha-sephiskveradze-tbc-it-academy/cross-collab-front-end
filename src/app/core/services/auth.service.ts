import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.test';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string; // Backend might return either format
  user?: {
    email: string;
    role: string;
  };
}

export interface PreregisterRequest {
  phoneNumber: string;
}

export interface PreregisterResponse {
  message?: string;
  oneTimePassword?: string; // might be returned for testing
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  oneTimePassword?: string;
  department: number;
}

export interface RegisterResponse {
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private http = inject(HttpClient);

  // ---- API Methods ----

  authenticate(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.authApiUrl}/users-auth/authenticate`;
    console.log('📡 [AUTH SERVICE] Making POST request to:', url);
    console.log('📤 [AUTH SERVICE] Request payload:', {
      email: credentials.email,
      password: '***hidden***',
    });

    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap({
        next: (response) => {
          const token = response.accessToken || response.access_token;
          console.log('📥 [AUTH SERVICE] Response received:', {
            hasToken: !!token,
            tokenFormat: response.accessToken ? 'accessToken' : response.access_token ? 'access_token' : 'none',
            hasUser: !!response.user,
            user: response.user,
            fullResponse: response,
          });
        },
        error: (error) => {
          console.error('📥 [AUTH SERVICE] Error response:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            fullError: error,
          });
        },
      })
    );
  }

  preregister(phoneNumber: string): Observable<PreregisterResponse> {
    const url = `${environment.authApiUrl}/users-auth/preregister`;

    // Ensure phoneNumber is a valid string
    const trimmedPhone = phoneNumber?.trim() || '';
    if (!trimmedPhone) {
      throw new Error('Phone number is required');
    }

    // Try sending as JSON object first (standard approach)
    const payload = { phoneNumber: trimmedPhone };
    console.log(`[${new Date().toISOString()}] 📡 [AUTH SERVICE] Making POST request to:`, url);
    console.log(`[${new Date().toISOString()}] 📤 [AUTH SERVICE] Request payload:`, {
      phoneNumber: trimmedPhone,
      payloadObject: payload,
      payloadStringified: JSON.stringify(payload),
    });

    // Explicitly set headers to ensure Content-Type is correct
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    });

    console.log(`[${new Date().toISOString()}] 📋 [AUTH SERVICE] Request headers:`, headers.keys());
    console.log(`[${new Date().toISOString()}] 📋 [AUTH SERVICE] Full request details:`, {
      url,
      method: 'POST',
      body: JSON.stringify(payload),
      headers: Object.fromEntries(headers.keys().map((key) => [key, headers.get(key)])),
    });

    return this.http.post<PreregisterResponse>(url, payload, { headers }).pipe(
      tap({
        next: (response) => {
          console.log('📥 [AUTH SERVICE] Preregister response received:', {
            message: response.message,
            hasOtp: !!response.oneTimePassword,
            fullResponse: response,
          });
        },
        error: (error) => {
          console.error(
            `[${new Date().toISOString()}] 📥 [AUTH SERVICE] Preregister error response:`,
            {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              errorStringified: JSON.stringify(error.error),
              fullError: error,
            }
          );
        },
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    const url = `${environment.authApiUrl}/users-auth/register`;

    // Filter out undefined values to avoid sending them in the request
    const payload: any = {
      userName: data.userName,
      email: data.email,
      department: data.department,
      password: data.password,
    };

    if (data.phoneNumber) {
      payload.phoneNumber = data.phoneNumber;
    }

    if (data.oneTimePassword) {
      payload.oneTimePassword = data.oneTimePassword;
    }

    console.log(`[${new Date().toISOString()}] 📡 [AUTH SERVICE] Making POST request to:`, url);
    console.log(`[${new Date().toISOString()}] 📤 [AUTH SERVICE] Request payload:`, {
      userName: payload.userName,
      email: payload.email,
      department: payload.department,
      phoneNumber: payload.phoneNumber,
      hasOtp: !!payload.oneTimePassword,
      password: '***hidden***',
      fullPayload: payload,
      payloadStringified: JSON.stringify(payload),
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    });

    return this.http.post<RegisterResponse>(url, payload, { headers }).pipe(
      tap({
        next: (response) => {
          console.log(
            `[${new Date().toISOString()}] 📥 [AUTH SERVICE] Registration response received:`,
            {
              message: response.message,
              user: response.user,
              fullResponse: response,
            }
          );
        },
        error: (error) => {
          console.error(
            `[${new Date().toISOString()}] 📥 [AUTH SERVICE] Registration error response:`,
            {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              errorStringified: JSON.stringify(error.error),
              errorText: error.error?.toString(),
              headers: error.headers,
              url: error.url,
              fullError: error,
            }
          );
        },
      })
    );
  }

  sendResetPasswordLink(email: string): Observable<ResetPasswordResponse> {
    const url = `${environment.authApiUrl}/users-auth/send-reset-password-link`;
    const payload = { email };
    console.log('📡 [AUTH SERVICE] Making POST request to:', url);
    console.log('📤 [AUTH SERVICE] Request payload:', payload);

    return this.http.post<ResetPasswordResponse>(url, payload).pipe(
      tap({
        next: (response) => {
          console.log('📥 [AUTH SERVICE] Reset password link response received:', {
            message: response.message,
            fullResponse: response,
          });
        },
        error: (error) => {
          console.error('📥 [AUTH SERVICE] Reset password link error response:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            fullError: error,
          });
        },
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<ResetPasswordResponse> {
    return this.http.put<ResetPasswordResponse>(
      `${environment.authApiUrl}/users-auth/reset-password`,
      {
        token,
        newPassword,
      }
    );
  }

  // ---- Token handling ----
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setUser(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
