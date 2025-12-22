import { Routes } from '@angular/router';
import { SignIn } from './features/auth/sign-in/sign-in';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SignIn,
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./features/auth/sign-up/sign-up').then((c) => c.SignUp),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((c) => c.ForgotPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events').then((c) => c.Events),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/event-details/event-details').then((c) => c.EventDetails),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/main/main').then((c) => c.Main),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
