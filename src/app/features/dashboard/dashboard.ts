import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';

import { DashboardSummaryResponse } from './models/dashboard.models';
import { DashboardService } from './services/dashboard.service';

type SummaryCard = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly summary = signal<DashboardSummaryResponse | null>(null);
  protected readonly summaryCards = computed<readonly SummaryCard[]>(() => {
    const summary = this.summary();

    if (!summary) {
      return [];
    }

    return [
      {
        id: 'total-spaces',
        label: 'Total de espacios',
        value: String(summary.totalSpaces),
        detail: 'Capacidad total registrada',
      },
      {
        id: 'available-spaces',
        label: 'Espacios disponibles',
        value: String(summary.availableSpaces),
        detail: 'Espacios libres actualmente',
      },
      {
        id: 'occupied-spaces',
        label: 'Espacios ocupados',
        value: String(summary.occupiedSpaces),
        detail: 'Espacios con vehículos dentro',
      },
      {
        id: 'reserved-spaces',
        label: 'Espacios reservados',
        value: String(summary.reservedSpaces),
        detail: 'Espacios apartados para abonados',
      },
      {
        id: 'active-subscriptions',
        label: 'Abonados activos',
        value: String(summary.activeSubscriptions),
        detail: 'Suscripciones vigentes',
      },
      {
        id: 'expired-subscriptions',
        label: 'Abonados vencidos',
        value: String(summary.expiredSubscriptions),
        detail: 'Suscripciones pendientes de renovación',
      },
      {
        id: 'today-revenue',
        label: 'Ingresos del día',
        value: this.currencyFormatter.format(summary.todayRevenue),
        detail: 'Importe generado hoy',
      },
      {
        id: 'closed-tickets-today',
        label: 'Tickets cerrados hoy',
        value: String(summary.closedTicketsToday),
        detail: 'Tickets finalizados durante el día',
      },
    ];
  });

  ngOnInit(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService
      .getSummary()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.summary.set(result.data);
            return;
          }

          this.summary.set(null);
          this.errorMessage.set(result.message || 'No se pudo obtener el resumen del dashboard.');
        },
        error: (error: unknown) => {
          this.summary.set(null);
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      return 'No tienes autorización para ver el resumen del dashboard.';
    }

    return 'No se pudo conectar con el servicio del dashboard.';
  }
}
