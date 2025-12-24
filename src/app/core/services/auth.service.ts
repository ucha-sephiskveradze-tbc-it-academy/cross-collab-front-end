import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.test';

/**
 * Request/Response interfaces for authentication API endpoints
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string; // Backend may return either camelCase or snake_case format
  user?: {
    email: string;
    role: string;
  };
}

export interface PreregisterResponse {
  message?: string;
  oneTimePassword?: string; // May be returned for testing purposes
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

/**
 * Core authentication service handling API communication and token management.
 * Provides methods for login, registration, password reset, and token operations.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private http = inject(HttpClient);

  /**
   * Authenticates user with email and password.
   * Returns JWT token and optional user information.
   */
  authenticate(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.authApiUrl}/users-auth/authenticate`;
    return this.http.post<LoginResponse>(url, credentials);
  }

  /**
   * Sends OTP code to the provided phone number for registration.
   * Phone number must include country code (e.g., +995577966977).
   */
  preregister(phoneNumber: string): Observable<PreregisterResponse> {
    const url = `${environment.authApiUrl}/users-auth/preregister`;
    const trimmedPhone = phoneNumber?.trim() || '';

    if (!trimmedPhone) {
      throw new Error('Phone number is required');
    }

    const payload = { phoneNumber: trimmedPhone };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    });

    return this.http.post<PreregisterResponse>(url, payload, { headers });
  }

  /**
   * Registers a new user account.
   * Phone number and OTP are optional but recommended for account verification.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    const url = `${environment.authApiUrl}/users-auth/register`;

    // Build payload, excluding undefined values
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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    });

    return this.http.post<RegisterResponse>(url, payload, { headers });
  }

  /**
   * Sends a password reset link to the provided email address.
   */
  sendResetPasswordLink(email: string): Observable<ResetPasswordResponse> {
    const url = `${environment.authApiUrl}/users-auth/send-reset-password-link`;
    return this.http.post<ResetPasswordResponse>(url, { email });
  }

  /**
   * Resets user password using the reset token received via email.
   */
  resetPassword(token: string, newPassword: string): Observable<ResetPasswordResponse> {
    return this.http.put<ResetPasswordResponse>(
      `${environment.authApiUrl}/users-auth/reset-password`,
      { token, newPassword }
    );
  }

  /**
   * Stores JWT token in localStorage.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieves JWT token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Stores user information in localStorage.
   */
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Retrieves user information from localStorage.
   */
  getUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Clears authentication data from localStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
