import { Routes } from '@angular/router';
import { SignIn } from './features/auth/sign-in/sign-in';
import { adminGuard } from './core/guards/admin.guard';
import { Form } from './features/admin/form/form';
import { employeeGuard } from './core/guards/employee.guard';

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
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((c) => c.ResetPassword),
  },

  {
    path: 'dashboard',
    // canActivate: [employeeGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'notifications',
    canActivate: [employeeGuard],
    loadComponent: () =>
      import('./features/notifications/notifications').then((c) => c.Notifications),
  },

  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/event-details/event-details').then((c) => c.EventDetails),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events').then((c) => c.Events),
  },

  {
    path: 'admin/main',
    // canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/main/main').then((c) => c.Main),
  },

  {
    path: 'admin/main/:id',
    // canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/main/components/view/view').then((c) => c.View),
  },
  {
    path: 'admin/new',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/form/form').then((c) => c.Form),
  },
  {
    path: 'admin/edit/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/form/form').then((c) => c.Form),
  },
  {
    path: 'admin/analytics',
    // canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/analytics/analytics').then((c) => c.Analytics),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
