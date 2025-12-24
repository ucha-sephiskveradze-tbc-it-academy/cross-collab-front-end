import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthTokenService } from '../../../core/services/auth-token.service';

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

  /**
   * Computed signal indicating if the current user is an admin.
   * Used to conditionally render admin-specific navigation links.
   */
  isAdmin = computed(() => this.authTokenService.isAdmin());
}
