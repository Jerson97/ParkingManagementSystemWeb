import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.getCurrentUser();

  if (!authService.isAuthenticated() || !currentUser) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data['roles'] as readonly string[] | undefined;

  if (!allowedRoles || allowedRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
