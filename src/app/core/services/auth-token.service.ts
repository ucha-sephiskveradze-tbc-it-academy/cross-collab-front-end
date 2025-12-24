import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

/**
 * Supported user roles in the application.
 */
export type UserRole = 'Admin' | 'Employee';

/**
 * JWT payload structure. Supports multiple role field naming conventions
 * to ensure compatibility with different backend implementations.
 */
interface JwtPayload {
  role?: UserRole | string;
  Role?: UserRole | string;
  roleName?: UserRole | string;
  userRole?: UserRole | string;
  // ASP.NET Identity claim format
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: UserRole | string;
  exp?: number;
  sub?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Service for JWT token operations and role-based authorization checks.
 * Handles token decoding and role extraction from JWT payloads.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly TOKEN_KEY = 'access_token';

  /**
   * Retrieves the JWT token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Decodes the JWT token and returns the payload.
   * Returns null if token is invalid or missing.
   */
  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Extracts user role from the JWT token.
   * Checks multiple possible field names to support different backend implementations.
   * Returns normalized role ('Admin' or 'Employee') or null if not found.
   */
  getRole(): UserRole | null {
    const payload = this.getDecodedToken();
    if (!payload) return null;

    // Check various possible role field names
    const possibleRole =
      payload.role ??
      payload.Role ??
      payload.roleName ??
      payload.userRole ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!possibleRole) return null;

    // Normalize role to match UserRole type (case-insensitive)
    const role = possibleRole.toString().toLowerCase();
    if (role === 'admin') return 'Admin';
    if (role === 'employee') return 'Employee';

    return null;
  }

  /**
   * Checks if the current user has Admin role.
   */
  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  /**
   * Checks if the current user has Employee role.
   */
  isEmployee(): boolean {
    return this.getRole() === 'Employee';
  }

  /**
   * Checks if a user is currently logged in (token exists).
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Removes the authentication token from localStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
