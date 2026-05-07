import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import {
  CreateParkingEntryRequest,
  GetParkingEntryByTicketResponse,
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

  createEntry(request: CreateParkingEntryRequest): Observable<MessageResult<number>> {
    return this.http.post<MessageResult<number>>(this.parkingEntriesUrl, request);
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
}
