import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  GetParkingEntryHistoryFilters,
  GetParkingEntryHistoryResponse,
} from '../models/parking-entry.models';
import { ParkingEntriesService } from '../services/parking-entries.service';

@Component({
  selector: 'app-history',
  imports: [ReactiveFormsModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History implements OnInit {
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

  protected readonly today = this.getPeruDateInputValue();
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly historyEntries = signal<readonly GetParkingEntryHistoryResponse[]>([]);
  protected readonly hasSearched = signal(false);
  protected readonly filtersForm = this.formBuilder.nonNullable.group(
    {
      licensePlate: [
        '',
        [Validators.maxLength(7), Validators.pattern(/^[A-Z0-9]{3}-\d{3}$/)],
      ],
      from: [''],
      to: [''],
    },
    { validators: this.dateRangeValidator() },
  );

  ngOnInit(): void {
    this.loadHistory({});
  }

  protected submit(): void {
    this.errorMessage.set('');

    if (this.filtersForm.invalid) {
      this.filtersForm.markAllAsTouched();
      return;
    }

    const formValue = this.filtersForm.getRawValue();
    const filters: GetParkingEntryHistoryFilters = {
      licensePlate: formValue.licensePlate || undefined,
      from: formValue.from || undefined,
      to: formValue.to || undefined,
    };

    this.loadHistory(filters);
  }

  protected clearFilters(): void {
    this.filtersForm.reset({
      licensePlate: '',
      from: '',
      to: '',
    });
    this.loadHistory({});
  }

  protected formatLicensePlateInput(): void {
    const control = this.filtersForm.controls.licensePlate;
    const formattedValue = this.formatLicensePlate(control.value);

    if (control.value !== formattedValue) {
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  protected hasLicensePlateError(errorName: 'maxlength' | 'pattern'): boolean {
    const control = this.filtersForm.controls.licensePlate;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasDateError(errorName: 'fromInFuture' | 'toInFuture' | 'fromAfterTo'): boolean {
    return this.filtersForm.hasError(errorName) && (this.filtersForm.touched || this.filtersForm.dirty);
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
    if (status === 'Paid') {
      return 'Pagado';
    }

    if (status === 'Pending') {
      return 'Pendiente';
    }

    return status;
  }

  protected formatTicketStatus(status: string): string {
    if (status === 'Completed') {
      return 'Cerrado';
    }

    if (status === 'Inside') {
      return 'Abierto';
    }

    return status;
  }

  private loadHistory(filters: GetParkingEntryHistoryFilters): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.hasSearched.set(true);

    this.parkingEntriesService
      .getHistory(filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.historyEntries.set(result.data);
            return;
          }

          this.historyEntries.set([]);
          this.errorMessage.set(result.message || 'No se pudo consultar el historial.');
        },
        error: (error: unknown) => {
          this.historyEntries.set([]);
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo consultar el historial.'));
        },
      });
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const from = control.get('from')?.value as string | null;
      const to = control.get('to')?.value as string | null;
      const errors: ValidationErrors = {};

      if (from && from > this.today) {
        errors['fromInFuture'] = true;
      }

      if (to && to > this.today) {
        errors['toInFuture'] = true;
      }

      if (from && to && from > to) {
        errors['fromAfterTo'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
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

  private formatLicensePlate(value: string): string {
    const normalizedValue = value
      .toUpperCase()
      .replace(/[\s-]/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);

    if (normalizedValue.length <= 3) {
      return normalizedValue;
    }

    return `${normalizedValue.slice(0, 3)}-${normalizedValue.slice(3)}`;
  }

  private getPeruDateInputValue(): string {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Lima',
      year: 'numeric',
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';

    return `${year}-${month}-${day}`;
  }
}
