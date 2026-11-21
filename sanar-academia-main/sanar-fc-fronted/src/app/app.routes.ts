import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/admin/dashboard/dashboard';
import { CrearCategoriaComponent } from './pages/admin/crear-categoria/crear-categoria';
import { CrearJugadorComponent } from './pages/admin/crear-jugador/crear-jugador';
import { CrearUsuarioComponent } from './pages/admin/crear-usuario/crear-usuario';
import { ListarJugadoresComponent } from './pages/admin/listar-jugadores/listar-jugadores';
import { ListarUsuariosComponent } from './pages/admin/listar-usuarios/listar-usuarios';
import { EditarJugadorComponent } from './pages/admin/editar-jugador/editar-jugador';
import { PagoDetalleComponent } from './pages/admin/pago-detalle/pago-detalle';
import { PagosGeneralComponent } from './pages/admin/pagos-general/pagos-general';
import { RegistrarPagoComponent } from './pages/admin/registrar-pago/registrar-pago';
import { DashboardProfesorComponent } from './pages/profesor/dashboard-profesor/dashboard-profesor';
import { CrearPartidoComponent } from './pages/profesor/crear-partido/crear-partido';
import { PartidosComponent } from './pages/profesor/partidos/partidos';
import { DetallePartidoComponent } from './pages/profesor/detalle-partido/detalle-partido';
import { JugadoresComponent } from './pages/profesor/jugadores/jugadores';
import { DetalleJugadorComponent } from './pages/profesor/detalle-jugador/detalle-jugador';
import { EntrenamientosComponent } from './pages/profesor/entrenamientos/entrenamientos';
import { DetalleEntrenamientoComponent } from './pages/profesor/detalle-entrenamiento/detalle-entrenamiento';
import { CrearEntrenamientoComponent } from './pages/profesor/crear-entrenamiento/crear-entrenamiento';
import { EditarUsuarioComponent } from './pages/admin/editar-usuario/editar-usuario';
import { DashboardAcudienteComponent } from './pages/acudiente/dashboard-acudiente/dashboard-acudiente';
import { RegistroComponent } from './pages/registro/registro';
import { AvisosComponent } from './pages/avisos/avisos';
import { CategoriasComponent } from './pages/admin/categorias/categorias';
import { roleGuard, invitadoGuard } from './guards/role.guard';

// HU003 – cada grupo de rutas solo es accesible para su rol.
const soloAdmin = [roleGuard('admin')];
const soloProfesor = [roleGuard('profesor')];
const soloAcudiente = [roleGuard('acudiente')];

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent, canActivate: [invitadoGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [invitadoGuard] },

  // Rutas admin
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: soloAdmin },
  { path: 'admin/crear-categoria', component: CrearCategoriaComponent, canActivate: soloAdmin },
  { path: 'admin/crear-jugador', component: CrearJugadorComponent, canActivate: soloAdmin },
  { path: 'admin/crear-usuario', component: CrearUsuarioComponent, canActivate: soloAdmin },
  { path: 'admin/editar-jugador/:id', component: EditarJugadorComponent, canActivate: soloAdmin },
  { path: 'admin/jugadores', component: ListarJugadoresComponent, canActivate: soloAdmin },
  { path: 'admin/usuarios', component: ListarUsuariosComponent, canActivate: soloAdmin },
  { path: 'admin/pagos/nuevo', component: RegistrarPagoComponent, canActivate: soloAdmin },
  { path: 'admin/pagos', component: PagosGeneralComponent, canActivate: soloAdmin },
  { path: 'admin/pago-detalle/:id', component: PagoDetalleComponent, canActivate: soloAdmin },
  { path: 'admin/categorias', component: CategoriasComponent, canActivate: soloAdmin },
  { path: 'admin/avisos', component: AvisosComponent, canActivate: soloAdmin },
  { path: 'admin/editar-usuario/:id', component: EditarUsuarioComponent, canActivate: soloAdmin },
  { path: 'admin/entrenamientos', component: EntrenamientosComponent, canActivate: soloAdmin },
  { path: 'admin/crear-entrenamiento', component: CrearEntrenamientoComponent, canActivate: soloAdmin },
  { path: 'admin/entrenamiento-detalle/:id', component: DetalleEntrenamientoComponent, canActivate: soloAdmin },
  { path: 'admin/partidos', component: PartidosComponent, canActivate: soloAdmin },
  { path: 'admin/crear-partido', component: CrearPartidoComponent, canActivate: soloAdmin },
  { path: 'admin/partido-detalle/:id', component: DetallePartidoComponent, canActivate: soloAdmin },

  // Rutas acudiente
  { path: 'acudiente/dashboard', component: DashboardAcudienteComponent, canActivate: soloAcudiente },

  // Rutas profesor
  { path: 'profesor/dashboard', component: DashboardProfesorComponent, canActivate: soloProfesor },
  { path: 'profesor/crear-partido', component: CrearPartidoComponent, canActivate: soloProfesor },
  { path: 'profesor/partidos', component: PartidosComponent, canActivate: soloProfesor },
  { path: 'profesor/partido-detalle/:id', component: DetallePartidoComponent, canActivate: soloProfesor },
  { path: 'profesor/jugadores', component: JugadoresComponent, canActivate: soloProfesor },
  { path: 'profesor/jugador-detalle/:id', component: DetalleJugadorComponent, canActivate: soloProfesor },
  { path: 'profesor/entrenamientos', component: EntrenamientosComponent, canActivate: soloProfesor },
  { path: 'profesor/entrenamiento-detalle/:id', component: DetalleEntrenamientoComponent, canActivate: soloProfesor },
  { path: 'profesor/crear-entrenamiento', component: CrearEntrenamientoComponent, canActivate: soloProfesor },
  { path: 'profesor/avisos', component: AvisosComponent, canActivate: soloProfesor },
  { path: '**', redirectTo: '' }
];