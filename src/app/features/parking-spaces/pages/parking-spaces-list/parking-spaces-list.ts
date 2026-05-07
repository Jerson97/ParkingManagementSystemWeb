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

import { ParkingSpaceResponse } from '../../models/parking-space.models';
import { ParkingSpacesService } from '../../services/parking-spaces.service';

type SummaryCard = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

@Component({
  selector: 'app-parking-spaces-list',
  templateUrl: './parking-spaces-list.html',
  styleUrl: './parking-spaces-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParkingSpacesList implements OnInit {
  private readonly parkingSpacesService = inject(ParkingSpacesService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly spaces = signal<readonly ParkingSpaceResponse[]>([]);
  protected readonly summaryCards = computed<readonly SummaryCard[]>(() => {
    const spaces = this.spaces();

    return [
      {
        id: 'total',
        label: 'Total de espacios',
        value: String(spaces.length),
      },
      {
        id: 'available',
        label: 'Disponibles',
        value: String(spaces.filter((space) => space.status === 'Available').length),
      },
      {
        id: 'occupied',
        label: 'Ocupados',
        value: String(spaces.filter((space) => space.status === 'Occupied').length),
      },
      {
        id: 'reserved',
        label: 'Reservados',
        value: String(spaces.filter((space) => space.status === 'Reserved').length),
      },
    ];
  });

  ngOnInit(): void {
    this.loadSpaces();
  }

  protected formatStatus(status: string): string {
    if (status === 'Available') {
      return 'Disponible';
    }

    if (status === 'Occupied') {
      return 'Ocupado';
    }

    if (status === 'Reserved') {
      return 'Reservado';
    }

    return status;
  }

  protected formatOptionalValue(value: string | null): string {
    return value ?? '—';
  }

  private loadSpaces(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.parkingSpacesService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          if (result.code === 1 && result.data) {
            this.spaces.set(result.data);
            return;
          }

          this.spaces.set([]);
          this.errorMessage.set(result.message || 'No se pudo consultar los espacios.');
        },
        error: (error: unknown) => {
          this.spaces.set([]);
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

    return 'No se pudo consultar los espacios.';
  }
}
