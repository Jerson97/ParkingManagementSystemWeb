import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'parking-entries/new',
        loadComponent: () =>
          import('./features/parking-entries/create-entry/create-entry').then(
            (m) => m.CreateEntry,
          ),
      },
      {
        path: 'parking-entries/calculate',
        loadComponent: () =>
          import('./features/parking-entries/calculate-fee/calculate-fee').then(
            (m) => m.CalculateFee,
          ),
      },
      {
        path: 'parking-entries/exit',
        loadComponent: () =>
          import('./features/parking-entries/register-exit/register-exit').then(
            (m) => m.RegisterExit,
          ),
      },
      {
        path: 'parking-entries/search',
        loadComponent: () =>
          import('./features/parking-entries/search-ticket/search-ticket').then(
            (m) => m.SearchTicket,
          ),
      },
      {
        path: 'parking-entries/history',
        loadComponent: () =>
          import('./features/parking-entries/history/history').then((m) => m.History),
      },
      {
        path: 'parking-spaces',
        loadComponent: () =>
          import(
            './features/parking-spaces/pages/parking-spaces-list/parking-spaces-list'
          ).then((m) => m.ParkingSpacesList),
      },
      {
        path: 'rate-types',
        canActivate: [roleGuard],
        data: {
          roles: ['Admin'],
        },
        loadComponent: () =>
          import('./features/rate-types/pages/rate-types-list/rate-types-list').then(
            (m) => m.RateTypesList,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
];
