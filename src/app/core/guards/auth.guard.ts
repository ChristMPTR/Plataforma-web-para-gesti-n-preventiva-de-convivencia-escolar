import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();
  if (!user) {
    return router.parseUrl('/login');
  }

  const requiredRole = route.data?.['role'] as RolUsuario | undefined;
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return router.parseUrl('/dashboard');
  }

  const requiredPermission = route.data?.['permission'] as string | undefined;
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
