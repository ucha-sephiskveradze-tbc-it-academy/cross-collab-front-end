import { Injectable } from '@angular/core';

export type UserRole = 'USER' | 'ADMIN';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn = false;
  private role: UserRole | null = null;

  // --- Auth state ---
  login(role: UserRole = 'USER') {
    this.isLoggedIn = true;
    this.role = role;
  }

  logout() {
    this.isLoggedIn = false;
    this.role = null;
  }

  // --- Checks ---
  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  isAdmin(): boolean {
    return this.isLoggedIn && this.role === 'ADMIN';
  }

  getRole(): UserRole | null {
    return this.role;
  }
}
