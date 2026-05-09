import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import {
  CreateRateTypeRequest,
  RateTypeResponse,
  UpdateRateTypeRequest,
} from '../models/rate-type.models';

@Injectable({
  providedIn: 'root',
})
export class RateTypesService {
  private readonly http = inject(HttpClient);
  private readonly rateTypesUrl = `${environment.apiBaseUrl}/api/rate-types`;

  getAll(): Observable<MessageResult<readonly RateTypeResponse[]>> {
    return this.http.get<MessageResult<readonly RateTypeResponse[]>>(this.rateTypesUrl);
  }

  getRateTypes(): Observable<MessageResult<readonly RateTypeResponse[]>> {
    return this.getAll();
  }

  create(request: CreateRateTypeRequest): Observable<MessageResult<number>> {
    return this.http.post<MessageResult<number>>(this.rateTypesUrl, request);
  }

  update(id: number, request: UpdateRateTypeRequest): Observable<MessageResult<number>> {
    return this.http.patch<MessageResult<number>>(`${this.rateTypesUrl}/${id}`, request);
  }

  deactivate(id: number): Observable<MessageResult<number>> {
    return this.http.delete<MessageResult<number>>(`${this.rateTypesUrl}/${id}`);
  }
}
