import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Favoritos } from './favoritos/favoritos';
import { VerMasTarde } from './ver-mas-tarde/ver-mas-tarde';
import { Login } from './login/login';
import { Register } from './register/register';
import { AltaPelicula } from './alta-pelicula/alta-pelicula';
import { Reproducir } from './reproducir/reproducir';
import { authGuard } from './auth-guard';
import { loginGuard } from './login-guard';
import { adminGuard } from './admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: Register, canActivate: [loginGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'alta-pelicula', component: AltaPelicula, canActivate: [authGuard, adminGuard] },
  { path: 'reproducir', component: Reproducir, canActivate: [authGuard] },
  { path: 'favoritos', component: Favoritos, canActivate: [authGuard] },
  { path: 'ver-mas-tarde', component: VerMasTarde, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];
