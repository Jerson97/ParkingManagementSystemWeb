import { ChangeDetectionStrategy, Component } from '@angular/core';

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
export class Dashboard {
  protected readonly summaryCards: readonly SummaryCard[] = [
    {
      id: 'vehicles-inside',
      label: 'Vehículos dentro',
      value: '18',
      detail: 'Ocupación actual registrada',
    },
    {
      id: 'available-spaces',
      label: 'Espacios disponibles',
      value: '32',
      detail: 'Capacidad libre estimada',
    },
    {
      id: 'daily-tickets',
      label: 'Tickets del día',
      value: '47',
      detail: 'Movimientos generados hoy',
    },
    {
      id: 'active-subscriptions',
      label: 'Abonados activos',
      value: '12',
      detail: 'Clientes con suscripción vigente',
    },
  ];
}
