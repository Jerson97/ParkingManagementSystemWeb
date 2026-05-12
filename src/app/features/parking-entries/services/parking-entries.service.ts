import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import {
  CreateParkingEntryRequest,
  CreateParkingEntryResponse,
  GetParkingEntryByTicketResponse,
  GetParkingEntryHistoryFilters,
  GetParkingEntryHistoryResponse,
  GetParkingFeeRequest,
  GetParkingFeeResponse,
  RegisterVehicleExitRequest,
  RegisterVehicleExitResponse,
} from '../models/parking-entry.models';

@Injectable({
  providedIn: 'root',
})
export class ParkingEntriesService {
  private readonly http = inject(HttpClient);
  private readonly parkingEntriesUrl = `${environment.apiBaseUrl}/api/parkingentries`;

  createEntry(
    request: CreateParkingEntryRequest,
  ): Observable<MessageResult<CreateParkingEntryResponse>> {
    return this.http.post<MessageResult<CreateParkingEntryResponse>>(this.parkingEntriesUrl, request);
  }

  calculateFee(request: GetParkingFeeRequest): Observable<MessageResult<GetParkingFeeResponse>> {
    return this.http.post<MessageResult<GetParkingFeeResponse>>(
      `${this.parkingEntriesUrl}/calculate`,
      request,
    );
  }

  registerExit(
    request: RegisterVehicleExitRequest,
  ): Observable<MessageResult<RegisterVehicleExitResponse>> {
    return this.http.post<MessageResult<RegisterVehicleExitResponse>>(
      `${this.parkingEntriesUrl}/exit`,
      request,
    );
  }

  getByTicket(ticketNumber: string): Observable<MessageResult<GetParkingEntryByTicketResponse>> {
    return this.http.get<MessageResult<GetParkingEntryByTicketResponse>>(
      `${this.parkingEntriesUrl}/${encodeURIComponent(ticketNumber)}`,
    );
  }

  getHistory(
    filters: GetParkingEntryHistoryFilters,
  ): Observable<MessageResult<readonly GetParkingEntryHistoryResponse[]>> {
    let params = new HttpParams();

    if (filters.licensePlate) {
      params = params.set('licensePlate', filters.licensePlate);
    }

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    return this.http.get<MessageResult<readonly GetParkingEntryHistoryResponse[]>>(
      `${this.parkingEntriesUrl}/history`,
      { params },
    );
  }
}
