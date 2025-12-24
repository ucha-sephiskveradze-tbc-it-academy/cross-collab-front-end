import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'Admin' | 'Employee';

interface JwtPayload {
  role?: UserRole | string;
  Role?: UserRole | string;
  roleName?: UserRole | string;
  userRole?: UserRole | string;
  // ASP.NET Identity alternative:
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: UserRole | string;
  exp?: number;
  sub?: string;
  [key: string]: any; // Allow any other fields
}

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly TOKEN_KEY = 'access_token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  getRole(): 'Admin' | 'Employee' | null {
    const payload = this.getDecodedToken();
    if (!payload) return null;

    const possibleRole =
      payload.role ??
      payload.Role ??
      payload.roleName ??
      payload.userRole ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!possibleRole) return null;

    const role = possibleRole.toString().toLowerCase();
    if (role === 'admin') return 'Admin';
    if (role === 'employee') return 'Employee';

    return null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isEmployee(): boolean {
    return this.getRole() === 'Employee';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
