import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../services/auth';

/**
 * HU003 – Control de acceso por rol.
 * Sin sesión → /login. Con sesión pero rol distinto → su propio panel.
 */
export function roleGuard(...roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.rol();
    if (!rol) return router.parseUrl('/login');
    return roles.includes(rol) ? true : router.parseUrl(auth.rutaInicio(rol));
  };
}

/** Evita que un usuario con sesión vuelva a ver login/registro. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).parseUrl(auth.rutaInicio()) : true;
};
