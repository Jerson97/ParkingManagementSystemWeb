import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import { CreateParkingEntryRequest } from '../models/parking-entry.models';

@Injectable({
  providedIn: 'root',
})
export class ParkingEntriesService {
  private readonly http = inject(HttpClient);
  private readonly parkingEntriesUrl = `${environment.apiBaseUrl}/api/parkingentries`;

  createEntry(request: CreateParkingEntryRequest): Observable<MessageResult<number>> {
    return this.http.post<MessageResult<number>>(this.parkingEntriesUrl, request);
  }
}
