import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { GetParkingEntryByTicketResponse } from '../models/parking-entry.models';
import { ParkingEntriesService } from '../services/parking-entries.service';

@Component({
  selector: 'app-search-ticket',
  imports: [ReactiveFormsModule],
  templateUrl: './search-ticket.html',
  styleUrl: './search-ticket.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTicket {
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingEntriesService = inject(ParkingEntriesService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZone: 'America/Lima',
    year: 'numeric',
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly ticketResult = signal<GetParkingEntryByTicketResponse | null>(null);
  protected readonly searchForm = this.formBuilder.nonNullable.group({
    ticketNumber: ['', [Validators.required, Validators.maxLength(30)]],
  });

  protected submit(): void {
    this.errorMessage.set('');
    this.ticketResult.set(null);

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const ticketNumber = this.searchForm.controls.ticketNumber.value.trim().toUpperCase();

    this.isLoading.set(true);

    this.parkingEntriesService
      .getByTicket(ticketNumber)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.ticketResult.set(result.data);
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo buscar el ticket.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo buscar el ticket.'));
        },
      });
  }

  protected hasTicketNumberError(errorName: 'required' | 'maxlength'): boolean {
    const control = this.searchForm.controls.ticketNumber;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected formatAmount(amount: number | null): string {
    if (amount === null) {
      return 'Pendiente';
    }

    return this.currencyFormatter.format(amount);
  }

  protected formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return this.dateFormatter.format(date);
  }

  protected formatExitTime(value: string | null): string {
    if (value === null) {
      return 'Aún dentro';
    }

    return this.formatDate(value);
  }

  protected formatPaymentStatus(status: string): string {
    if (status === 'Pending') {
      return 'Pendiente';
    }

    if (status === 'Paid') {
      return 'Pagado';
    }

    return status;
  }

  protected formatTicketStatus(status: string): string {
    if (status === 'Inside') {
      return 'Dentro';
    }

    if (status === 'Completed') {
      return 'Completado';
    }

    return status;
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
