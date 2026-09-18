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
import { DashboardProfesorComponent } from './pages/profesor/dashboard-profesor/dashboard-profesor';
import { CrearPartidoComponent } from './pages/profesor/crear-partido/crear-partido';
import { PartidosComponent } from './pages/profesor/partidos/partidos';
import { DetallePartidoComponent } from './pages/profesor/detalle-partido/detalle-partido';
import { JugadoresComponent } from './pages/profesor/jugadores/jugadores';
import { DetalleJugadorComponent } from './pages/profesor/detalle-jugador/detalle-jugador';
import { EntrenamientosComponent } from './pages/profesor/entrenamientos/entrenamientos';
import { DetalleEntrenamientoComponent } from './pages/profesor/detalle-entrenamiento/detalle-entrenamiento';
import { CrearEntrenamientoComponent } from './pages/profesor/crear-entrenamiento/crear-entrenamiento';
import { EditarUsuarioComponent } from './pages/admin/editar-usuario/editar-usuario'; // Ajusta la ruta a tu archivo

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },

  // Rutas admin
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/crear-categoria', component: CrearCategoriaComponent },
  { path: 'admin/crear-jugador', component: CrearJugadorComponent },
  { path: 'admin/crear-usuario', component: CrearUsuarioComponent },
  { path: 'admin/editar-jugador/:id', component: EditarJugadorComponent },
  { path: 'admin/jugadores', component: ListarJugadoresComponent },
  { path: 'admin/usuarios', component: ListarUsuariosComponent },
  { path: 'admin/pagos', component: PagosGeneralComponent },
  { path: 'admin/pago-detalle/:id', component: PagoDetalleComponent },
  { path: 'admin/editar-usuario/:id', component: EditarUsuarioComponent },

  // Rutas profesor
  { path: 'profesor/dashboard', component: DashboardProfesorComponent },
  { path: 'profesor/crear-partido', component: CrearPartidoComponent },
  { path: 'profesor/partidos', component: PartidosComponent },
  { path: 'profesor/partido-detalle/:id', component: DetallePartidoComponent },
  { path: 'profesor/jugadores', component: JugadoresComponent },
  { path: 'profesor/jugador-detalle/:id', component: DetalleJugadorComponent },
  { path: 'profesor/entrenamientos', component: EntrenamientosComponent },
  { path: 'profesor/entrenamiento-detalle/:id', component: DetalleEntrenamientoComponent },
  { path: 'profesor/crear-entrenamiento', component: CrearEntrenamientoComponent }

];