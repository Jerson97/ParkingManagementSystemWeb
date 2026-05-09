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

import {
  CreateRateTypeRequest,
  RateTypeResponse,
  UpdateRateTypeRequest,
} from '../../models/rate-type.models';
import { RateTypesService } from '../../services/rate-types.service';

@Component({
  selector: 'app-rate-types-list',
  imports: [ReactiveFormsModule],
  templateUrl: './rate-types-list.html',
  styleUrl: './rate-types-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateTypesList implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly rateTypesService = inject(RateTypesService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  });

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly deactivatingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly rateTypes = signal<readonly RateTypeResponse[]>([]);
  protected readonly editingRateType = signal<RateTypeResponse | null>(null);
  protected readonly isEditing = computed(() => this.editingRateType() !== null);
  protected readonly rateTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    isHourly: [false],
  });

  ngOnInit(): void {
    this.loadRateTypes();
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.rateTypeForm.invalid) {
      this.rateTypeForm.markAllAsTouched();
      return;
    }

    const formValue = this.rateTypeForm.getRawValue();
    const request: CreateRateTypeRequest | UpdateRateTypeRequest = {
      name: formValue.name.trim(),
      price: formValue.price,
      isHourly: formValue.isHourly,
    };
    const editingRateType = this.editingRateType();

    this.isSaving.set(true);

    const operation = editingRateType
      ? this.rateTypesService.update(editingRateType.id, request)
      : this.rateTypesService.create(request);

    operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (result) => {
        if (result.code === 1 && result.data !== null) {
          this.successMessage.set(
            result.message ||
              (editingRateType
                ? 'Tarifa actualizada correctamente.'
                : 'Tarifa registrada correctamente.'),
          );
          this.resetForm();
          this.loadRateTypes();
          return;
        }

        this.errorMessage.set(result.message || 'No se pudo guardar la tarifa.');
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error, 'No se pudo guardar la tarifa.'));
      },
    });
  }

  protected edit(rateType: RateTypeResponse): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.editingRateType.set(rateType);
    this.rateTypeForm.setValue({
      name: rateType.name,
      price: rateType.price,
      isHourly: rateType.isHourly,
    });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected deactivate(rateType: RateTypeResponse): void {
    const confirmed = confirm('¿Seguro que deseas desactivar esta tarifa?');

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deactivatingId.set(rateType.id);

    this.rateTypesService
      .deactivate(rateType.id)
      .pipe(finalize(() => this.deactivatingId.set(null)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data !== null) {
            this.successMessage.set(result.message || 'Tarifa desactivada correctamente.');
            this.loadRateTypes();
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo desactivar la tarifa.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo desactivar la tarifa.'));
        },
      });
  }

  protected hasNameError(errorName: 'required' | 'maxlength'): boolean {
    const control = this.rateTypeForm.controls.name;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasPriceError(): boolean {
    const control = this.rateTypeForm.controls.price;
    return (control.hasError('required') || control.hasError('min')) && (control.touched || control.dirty);
  }

  protected formatPrice(price: number): string {
    return this.currencyFormatter.format(price);
  }

  protected formatType(isHourly: boolean): string {
    return isHourly ? 'Por hora' : 'Fija';
  }

  protected formatStatus(isActive: boolean): string {
    return isActive ? 'Activa' : 'Inactiva';
  }

  private loadRateTypes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.rateTypesService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
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

  private resetForm(): void {
    this.editingRateType.set(null);
    this.rateTypeForm.reset({
      name: '',
      price: 0,
      isHourly: false,
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
