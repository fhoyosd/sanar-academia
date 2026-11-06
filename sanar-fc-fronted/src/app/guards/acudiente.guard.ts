import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const acudienteGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (typeof localStorage === 'undefined') return router.parseUrl('/login');
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    return usuario?.rol === 'acudiente' ? true : router.parseUrl('/login');
  } catch {
    return router.parseUrl('/login');
  }
};
