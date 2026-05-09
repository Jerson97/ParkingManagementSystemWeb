import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { SubscriptionResponse } from '../../models/subscription.models';
import { SubscriptionsService } from '../../services/subscriptions.service';

type SummaryCard = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

@Component({
  selector: 'app-subscriptions-list',
  templateUrl: './subscriptions-list.html',
  styleUrl: './subscriptions-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsList implements OnInit {
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly subscriptions = signal<readonly SubscriptionResponse[]>([]);
  protected readonly summaryCards = computed<readonly SummaryCard[]>(() => {
    const subscriptions = this.subscriptions();

    return [
      {
        id: 'total',
        label: 'Total de abonados',
        value: String(subscriptions.length),
      },
      {
        id: 'active',
        label: 'Activos',
        value: String(
          subscriptions.filter((subscription) => subscription.status === 'Active').length,
        ),
      },
      {
        id: 'expired',
        label: 'Vencidos',
        value: String(
          subscriptions.filter((subscription) => subscription.status === 'Expired').length,
        ),
      },
    ];
  });

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  protected formatStatus(status: string): string {
    if (status === 'Active') {
      return 'Activo';
    }

    if (status === 'Expired') {
      return 'Vencido';
    }

    return status;
  }

  protected getStatusClass(status: string): string {
    if (status === 'Active') {
      return 'status-badge is-active';
    }

    if (status === 'Expired') {
      return 'status-badge is-expired';
    }

    return 'status-badge';
  }

  protected formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return this.dateFormatter.format(date);
  }

  private loadSubscriptions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.subscriptionsService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.subscriptions.set(result.data);
            return;
          }

          this.subscriptions.set([]);
          this.errorMessage.set(result.message || 'No se pudieron consultar los abonados.');
        },
        error: (error: unknown) => {
          this.subscriptions.set([]);
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const responseBody = error.error as { message?: unknown } | null;

      if (typeof responseBody?.message === 'string') {
        return responseBody.message;
      }
    }

    return 'No se pudieron consultar los abonados.';
  }
}
