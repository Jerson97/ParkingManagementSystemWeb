import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MessageResult } from '../../../core/models/message-result';
import {
  CreateSubscriptionRequest,
  SubscriptionResponse,
} from '../models/subscription.models';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionsService {
  private readonly http = inject(HttpClient);
  private readonly subscriptionsUrl = `${environment.apiBaseUrl}/api/subscriptions`;

  getAll(): Observable<MessageResult<readonly SubscriptionResponse[]>> {
    return this.http.get<MessageResult<readonly SubscriptionResponse[]>>(this.subscriptionsUrl);
  }

  create(request: CreateSubscriptionRequest): Observable<MessageResult<number>> {
    return this.http.post<MessageResult<number>>(this.subscriptionsUrl, request);
  }
}
