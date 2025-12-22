import { Injectable } from '@angular/core';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  // ---- Token handling ----
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ---- JWT helpers ----
  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const payload = this.decodeToken();
    if (!payload) return false;

    return payload.exp * 1000 > Date.now();
  }

  hasRole(role: string): boolean {
    const payload = this.decodeToken();
    return !!payload && payload.role === role;
  }
}
