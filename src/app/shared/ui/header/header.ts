import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthTokenService } from '../../../core/services/auth-token.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Header component displaying navigation links.
 * Shows different navigation items based on user role (Admin vs Employee).
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authTokenService = inject(AuthTokenService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Computed signal indicating if the current user is an admin.
   * Used to conditionally render admin-specific navigation links.
   */
  isAdmin = computed(() => this.authTokenService.isAdmin());

  /**
   * Signal controlling the visibility of the user dropdown menu.
   */
  isDropdownOpen = signal(false);

  /**
   * Listens for clicks outside the dropdown to close it.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const profileElement = target.closest('.right__profile');
    if (!profileElement && this.isDropdownOpen()) {
      this.closeDropdown();
    }
  }

  /**
   * Toggles the dropdown menu visibility.
   */
  toggleDropdown(): void {
    this.isDropdownOpen.update(value => !value);
  }

  /**
   * Closes the dropdown menu.
   */
  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  /**
   * Logs out the user by clearing authentication data and redirecting to login.
   */
  logout(): void {
    this.authService.logout();
    this.authTokenService.logout();
    this.closeDropdown();
    this.router.navigate(['/login']);
  }
}
