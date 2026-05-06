import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { GetParkingFeeResponse } from '../models/parking-entry.models';
import { ParkingEntriesService } from '../services/parking-entries.service';

@Component({
  selector: 'app-calculate-fee',
  imports: [ReactiveFormsModule],
  templateUrl: './calculate-fee.html',
  styleUrl: './calculate-fee.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculateFee {
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
  protected readonly feeResult = signal<GetParkingFeeResponse | null>(null);
  protected readonly feeForm = this.formBuilder.nonNullable.group({
    ticketNumber: ['', [Validators.required, Validators.maxLength(30)]],
  });

  protected submit(): void {
    this.errorMessage.set('');
    this.feeResult.set(null);

    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    const request = {
      ticketNumber: this.feeForm.controls.ticketNumber.value.trim().toUpperCase(),
    };

    this.isLoading.set(true);

    this.parkingEntriesService
      .calculateFee(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.feeResult.set(result.data);
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo consultar el monto estimado.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.getErrorMessage(error, 'No se pudo consultar el monto estimado.'),
          );
        },
      });
  }

  protected hasTicketNumberError(errorName: 'required' | 'maxlength'): boolean {
    const control = this.feeForm.controls.ticketNumber;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected formatAmount(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  protected formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return this.dateFormatter.format(date);
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
