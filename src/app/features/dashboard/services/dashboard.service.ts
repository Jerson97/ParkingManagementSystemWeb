import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import { DashboardSummaryResponse } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly summaryUrl = `${environment.apiBaseUrl}/api/dashboard/summary`;

  getSummary(): Observable<MessageResult<DashboardSummaryResponse>> {
    return this.http.get<MessageResult<DashboardSummaryResponse>>(this.summaryUrl);
  }
}
