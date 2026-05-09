import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = signal(this.authService.getCurrentUser());
  private readonly baseNavigationItems = [
    {
      label: 'Dashboard',
      route: '/dashboard',
    },
    {
      label: 'Registrar ingreso',
      route: '/parking-entries/new',
    },
    {
      label: 'Consultar monto',
      route: '/parking-entries/calculate',
    },
    {
      label: 'Registrar salida',
      route: '/parking-entries/exit',
    },
    {
      label: 'Buscar ticket',
      route: '/parking-entries/search',
    },
    {
      label: 'Historial',
      route: '/parking-entries/history',
    },
    {
      label: 'Espacios',
      route: '/parking-spaces',
    },
    {
      label: 'Abonados',
      route: '/subscriptions',
    },
  ] as const;
  protected readonly navigationItems = computed(() => {
    const currentUser = this.currentUser();

    if (currentUser?.role !== 'Admin') {
      return this.baseNavigationItems;
    }

    return [
      ...this.baseNavigationItems,
      {
        label: 'Tarifas',
        route: '/rate-types',
      },
    ] as const;
  });

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
