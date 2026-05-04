import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  protected readonly navigationItems = [
    {
      label: 'Dashboard',
      route: '/dashboard',
    },
  ] as const;

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
