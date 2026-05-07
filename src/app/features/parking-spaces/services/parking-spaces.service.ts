import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import { ParkingSpaceResponse } from '../models/parking-space.models';

@Injectable({
  providedIn: 'root',
})
export class ParkingSpacesService {
  private readonly http = inject(HttpClient);
  private readonly parkingSpacesUrl = `${environment.apiBaseUrl}/api/parkingspaces`;

  getAll(): Observable<MessageResult<readonly ParkingSpaceResponse[]>> {
    return this.http.get<MessageResult<readonly ParkingSpaceResponse[]>>(this.parkingSpacesUrl);
  }
}
