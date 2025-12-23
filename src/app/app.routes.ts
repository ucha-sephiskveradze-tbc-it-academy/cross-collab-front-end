import { Routes } from '@angular/router';
import { SignIn } from './features/auth/sign-in/sign-in';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Form } from './features/admin/form/form';

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
    // canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },

  {
    path: 'events',
    // canActivate: [authGuard],
    loadComponent: () => import('./features/events/events').then((c) => c.Events),
  },

  {
    path: 'events/:id',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./features/event-details/event-details').then((c) => c.EventDetails),
  },

  {
    path: 'admin/main',
    // canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/main/main').then((c) => c.Main),
  },

  {
    path: 'admin/main/:id',
    // canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/main/components/view/view').then((c) => c.View),
  },
  {
    path: 'admin/new',
    loadComponent: () => import('./features/admin/form/form').then((c) => c.Form),
  },
  {
    path: 'admin/edit/:id',
    loadComponent: () => import('./features/admin/form/form').then((c) => c.Form),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
