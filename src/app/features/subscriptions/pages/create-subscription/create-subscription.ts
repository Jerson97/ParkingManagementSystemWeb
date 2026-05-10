import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { ParkingSpaceResponse } from '../../../parking-spaces/models/parking-space.models';
import { ParkingSpacesService } from '../../../parking-spaces/services/parking-spaces.service';
import { RateTypeResponse } from '../../../rate-types/models/rate-type.models';
import { RateTypesService } from '../../../rate-types/services/rate-types.service';
import { CreateSubscriptionRequest } from '../../models/subscription.models';
import { SubscriptionsService } from '../../services/subscriptions.service';

@Component({
  selector: 'app-create-subscription',
  imports: [ReactiveFormsModule],
  templateUrl: './create-subscription.html',
  styleUrl: './create-subscription.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSubscription implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingSpacesService = inject(ParkingSpacesService);
  private readonly rateTypesService = inject(RateTypesService);
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  });

  protected readonly isLoadingCatalogs = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly rateTypes = signal<readonly RateTypeResponse[]>([]);
  protected readonly parkingSpaces = signal<readonly ParkingSpaceResponse[]>([]);
  protected readonly activeRateTypes = computed(() =>
    this.rateTypes().filter((rateType) => rateType.isActive),
  );
  protected readonly availableParkingSpaces = computed(() =>
    this.parkingSpaces().filter((space) => space.status === 'Available'),
  );
  protected readonly subscriptionForm = this.formBuilder.nonNullable.group(
    {
      customerName: ['', [Validators.required, Validators.maxLength(150)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      licensePlate: [
        '',
        [Validators.required, Validators.maxLength(7), Validators.pattern(/^[A-Z0-9]{3}-\d{3}$/)],
      ],
      rateTypeId: [0, [Validators.required, Validators.min(1)]],
      parkingSpaceId: [0, [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    },
    {
      validators: [this.endDateAfterStartDateValidator],
    },
  );

  ngOnInit(): void {
    this.loadCatalogs();
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    const formValue = this.subscriptionForm.getRawValue();
    const request: CreateSubscriptionRequest = {
      customerName: formValue.customerName.trim(),
      phoneNumber: formValue.phoneNumber.trim(),
      licensePlate: this.formatLicensePlate(formValue.licensePlate),
      rateTypeId: formValue.rateTypeId,
      parkingSpaceId: formValue.parkingSpaceId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
    };

    this.isSubmitting.set(true);

    this.subscriptionsService
      .create(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data !== null) {
            this.successMessage.set(result.message || 'Abonado registrado correctamente.');
            this.subscriptionForm.reset({
              customerName: '',
              phoneNumber: '',
              licensePlate: '',
              rateTypeId: 0,
              parkingSpaceId: 0,
              startDate: '',
              endDate: '',
            });
            this.loadAvailableParkingSpaces();
            return;
          }

          this.errorMessage.set(result.message || 'No se pudo registrar el abonado.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudo registrar el abonado.'));
        },
      });
  }

  protected formatLicensePlateInput(): void {
    const control = this.subscriptionForm.controls.licensePlate;
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

  protected hasCustomerNameError(errorName: 'required' | 'maxlength'): boolean {
    const control = this.subscriptionForm.controls.customerName;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasPhoneNumberError(errorName: 'required' | 'maxlength'): boolean {
    const control = this.subscriptionForm.controls.phoneNumber;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasLicensePlateError(errorName: 'required' | 'maxlength' | 'pattern'): boolean {
    const control = this.subscriptionForm.controls.licensePlate;
    return control.hasError(errorName) && (control.touched || control.dirty);
  }

  protected hasRateTypeError(): boolean {
    const control = this.subscriptionForm.controls.rateTypeId;
    return (control.hasError('required') || control.hasError('min')) && (control.touched || control.dirty);
  }

  protected hasParkingSpaceError(): boolean {
    const control = this.subscriptionForm.controls.parkingSpaceId;
    return (control.hasError('required') || control.hasError('min')) && (control.touched || control.dirty);
  }

  protected hasStartDateError(): boolean {
    const control = this.subscriptionForm.controls.startDate;
    return control.hasError('required') && (control.touched || control.dirty);
  }

  protected hasEndDateError(): boolean {
    const control = this.subscriptionForm.controls.endDate;
    return control.hasError('required') && (control.touched || control.dirty);
  }

  protected hasDateRangeError(): boolean {
    const endDateControl = this.subscriptionForm.controls.endDate;
    return (
      this.subscriptionForm.hasError('endDateBeforeStartDate') &&
      (endDateControl.touched || endDateControl.dirty)
    );
  }

  private loadCatalogs(): void {
    this.isLoadingCatalogs.set(true);
    this.errorMessage.set('');

    forkJoin({
      rateTypes: this.rateTypesService.getRateTypes(),
      parkingSpaces: this.parkingSpacesService.getAll(),
    })
      .pipe(finalize(() => this.isLoadingCatalogs.set(false)))
      .subscribe({
        next: (result) => {
          if (result.rateTypes.code === 1 && result.rateTypes.data) {
            this.rateTypes.set(result.rateTypes.data);
          } else {
            this.rateTypes.set([]);
            this.errorMessage.set(result.rateTypes.message || 'No se pudieron cargar las tarifas.');
          }

          if (result.parkingSpaces.code === 1 && result.parkingSpaces.data) {
            this.parkingSpaces.set(result.parkingSpaces.data);
          } else {
            this.parkingSpaces.set([]);
            this.errorMessage.set(result.parkingSpaces.message || 'No se pudieron cargar los espacios.');
          }
        },
        error: (error: unknown) => {
          this.rateTypes.set([]);
          this.parkingSpaces.set([]);
          this.errorMessage.set(this.getErrorMessage(error, 'No se pudieron cargar los catálogos.'));
        },
      });
  }

  private loadAvailableParkingSpaces(): void {
    this.parkingSpacesService.getAll().subscribe({
      next: (result) => {
        if (result.code === 1 && result.data) {
          this.parkingSpaces.set(result.data);
          return;
        }

        this.parkingSpaces.set([]);
        this.errorMessage.set(result.message || 'No se pudieron cargar los espacios.');
      },
      error: (error: unknown) => {
        this.parkingSpaces.set([]);
        this.errorMessage.set(this.getErrorMessage(error, 'No se pudieron cargar los espacios.'));
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

  private endDateAfterStartDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (typeof startDate !== 'string' || typeof endDate !== 'string' || !startDate || !endDate) {
      return null;
    }

    return endDate > startDate ? null : { endDateBeforeStartDate: true };
  }
}
