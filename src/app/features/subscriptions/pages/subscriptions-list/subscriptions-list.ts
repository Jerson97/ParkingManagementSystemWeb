import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
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
  private readonly authService = inject(AuthService);
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly renewingSubscriptionId = signal<number | null>(null);
  protected readonly cancelingSubscriptionId = signal<number | null>(null);
  protected readonly currentUser = signal(this.authService.getCurrentUser());
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

  protected canCancel(subscription: SubscriptionResponse): boolean {
    return this.currentUser()?.role === 'Admin' && subscription.status === 'Active';
  }

  protected renew(subscriptionId: number): void {
    const confirmed = window.confirm('¿Seguro que deseas renovar esta suscripción?');

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.renewingSubscriptionId.set(subscriptionId);

    this.subscriptionsService
      .renew({ subscriptionId })
      .pipe(finalize(() => this.renewingSubscriptionId.set(null)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data !== null) {
            this.successMessage.set(result.message || 'Suscripción renovada correctamente.');
            this.loadSubscriptions({ clearMessages: false });
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo renovar la suscripción.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo renovar la suscripción.'));
        },
      });
  }

  protected cancel(subscriptionId: number): void {
    const confirmed = window.confirm('¿Seguro que deseas cancelar este abonado?');

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.cancelingSubscriptionId.set(subscriptionId);

    this.subscriptionsService
      .cancel(subscriptionId)
      .pipe(finalize(() => this.cancelingSubscriptionId.set(null)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data !== null) {
            this.successMessage.set(result.message || 'Abonado cancelado correctamente.');
            this.loadSubscriptions({ clearMessages: false });
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo cancelar el abonado.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo cancelar el abonado.'));
        },
      });
  }

  private loadSubscriptions(options: { readonly clearMessages: boolean } = { clearMessages: true }): void {
    this.isLoading.set(true);

    if (options.clearMessages) {
      this.errorMessage.set('');
      this.successMessage.set('');
    }

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
          this.successMessage.set('');
        },
        error: (error: unknown) => {
          this.subscriptions.set([]);
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudieron consultar los abonados.'));
          this.successMessage.set('');
        },
      });
  }

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const responseBody = error.error as { message?: unknown } | null;

      if (typeof responseBody?.message === 'string') {
        return responseBody.message;
      }
    }

    return fallbackMessage;
  }
}
