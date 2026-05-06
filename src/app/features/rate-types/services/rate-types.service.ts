import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import { RateTypeResponse } from '../models/rate-type.models';

@Injectable({
  providedIn: 'root',
})
export class RateTypesService {
  private readonly http = inject(HttpClient);
  private readonly rateTypesUrl = `${environment.apiBaseUrl}/api/rate-types`;

  getRateTypes(): Observable<MessageResult<readonly RateTypeResponse[]>> {
    return this.http.get<MessageResult<readonly RateTypeResponse[]>>(this.rateTypesUrl);
  }
}
