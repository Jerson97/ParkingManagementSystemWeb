import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { RateTypeResponse } from '../../rate-types/models/rate-type.models';
import { RateTypesService } from '../../rate-types/services/rate-types.service';
import { ParkingEntriesService } from '../services/parking-entries.service';

@Component({
  selector: 'app-create-entry',
  imports: [ReactiveFormsModule],
  templateUrl: './create-entry.html',
  styleUrl: './create-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEntry implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingEntriesService = inject(ParkingEntriesService);
  private readonly rateTypesService = inject(RateTypesService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  });

  protected readonly isLoadingRateTypes = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly rateTypes = signal<readonly RateTypeResponse[]>([]);
  protected readonly activeRateTypes = computed(() =>
    this.rateTypes().filter((rateType) => rateType.isActive),
  );
  protected readonly entryForm = this.formBuilder.nonNullable.group({
    licensePlate: [
      '',
      [Validators.required, Validators.maxLength(7), Validators.pattern(/^[A-Z0-9]{3}-\d{3}$/)],
    ],
    rateTypeId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadRateTypes();
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const formValue = this.entryForm.getRawValue();
    const request = {
      licensePlate: this.formatLicensePlate(formValue.licensePlate),
      rateTypeId: formValue.rateTypeId,
    };

    this.isSubmitting.set(true);

    this.parkingEntriesService
      .createEntry(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data !== null) {
            this.successMessage.set(result.message || 'Ingreso registrado correctamente.');
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo registrar el ingreso.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo registrar el ingreso.'));
        },
      });
  }

  protected formatLicensePlateInput(): void {
    const control = this.entryForm.controls.licensePlate;
    const formattedValue = this.formatLicensePlate(control.value);

    if (control.value !== formattedValue) {
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  protected formatRateType(rateType: RateTypeResponse): string {
    const price = this.currencyFormatter.format(rateType.price);

    if (rateType.isHourly) {
      return `${rateType.name} - ${price} por hora`;
    }

    return `${rateType.name} - ${price}`;
  }

  protected hasLicensePlateError(errorName: 'required' | 'maxlength' | 'pattern'): boolean {
    const control = this.entryForm.controls.licensePlate;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasRateTypeError(): boolean {
    const control = this.entryForm.controls.rateTypeId;
    return (control.hasError('required') || control.hasError('min')) && (control.touched || control.dirty);
  }

  private loadRateTypes(): void {
    this.isLoadingRateTypes.set(true);
    this.errorMessage.set('');

    this.rateTypesService
      .getRateTypes()
      .pipe(finalize(() => this.isLoadingRateTypes.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.rateTypes.set(result.data);
            return;
          }

          this.rateTypes.set([]);
          this.errorMessage.set(result.message || 'No se pudieron cargar las tarifas.');
        },
        error: (error: unknown) => {
          this.rateTypes.set([]);
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudieron cargar las tarifas.'));
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
}
