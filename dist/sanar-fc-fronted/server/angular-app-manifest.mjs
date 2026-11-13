
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/"
  },
  {
    "renderMode": 1,
    "route": "/login"
  },
  {
    "renderMode": 1,
    "route": "/registro"
  },
  {
    "renderMode": 1,
    "route": "/admin/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/admin/crear-categoria"
  },
  {
    "renderMode": 1,
    "route": "/admin/crear-jugador"
  },
  {
    "renderMode": 1,
    "route": "/admin/crear-usuario"
  },
  {
    "renderMode": 1,
    "route": "/admin/editar-jugador/*"
  },
  {
    "renderMode": 1,
    "route": "/admin/jugadores"
  },
  {
    "renderMode": 1,
    "route": "/admin/usuarios"
  },
  {
    "renderMode": 1,
    "route": "/admin/pagos"
  },
  {
    "renderMode": 1,
    "route": "/admin/pagos/nuevo"
  },
  {
    "renderMode": 1,
    "route": "/admin/pago-detalle/*"
  },
  {
    "renderMode": 1,
    "route": "/admin/categorias"
  },
  {
    "renderMode": 1,
    "route": "/admin/avisos"
  },
  {
    "renderMode": 1,
    "route": "/admin/editar-usuario/*"
  },
  {
    "renderMode": 1,
    "route": "/acudiente/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/profesor/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/profesor/crear-partido"
  },
  {
    "renderMode": 1,
    "route": "/profesor/partidos"
  },
  {
    "renderMode": 1,
    "route": "/profesor/partido-detalle/*"
  },
  {
    "renderMode": 1,
    "route": "/profesor/jugadores"
  },
  {
    "renderMode": 1,
    "route": "/profesor/jugador-detalle/*"
  },
  {
    "renderMode": 1,
    "route": "/profesor/entrenamientos"
  },
  {
    "renderMode": 1,
    "route": "/profesor/entrenamiento-detalle/*"
  },
  {
    "renderMode": 1,
    "route": "/profesor/crear-entrenamiento"
  },
  {
    "renderMode": 1,
    "route": "/profesor/avisos"
  },
  {
    "renderMode": 1,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 794, hash: 'dd4c2ef52a191b222f484e76eeac0570564a22c2c9c4c702ac98f390fd59fca5', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1334, hash: '37650f8eafc60826a47109eb250d17949f3cc27cfea425b3bddb72a608e9b57e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)}
  },
};
