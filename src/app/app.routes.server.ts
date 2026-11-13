import { RenderMode, ServerRoute } from '@angular/ssr';

// La app depende de la sesión del usuario (cookies + localStorage), por eso
// se renderiza en el navegador. Así el menú refleja siempre el usuario actual.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
