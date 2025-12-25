import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from '../services/auth-token.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthTokenService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
