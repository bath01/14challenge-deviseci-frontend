import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/devise-ci/pages/pages').then(m => m.Pages)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
