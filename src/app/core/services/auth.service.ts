import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MessageResult } from '../models/message-result';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
} from '../../features/auth/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'parking.auth.token';
  private readonly userStorageKey = 'parking.auth.user';
  private readonly loginUrl = `${environment.apiBaseUrl}/api/auth/login`;

  login(request: LoginRequest): Observable<MessageResult<LoginResponse>> {
    return this.http.post<MessageResult<LoginResponse>>(this.loginUrl, request);
  }

  saveSession(loginResponse: LoginResponse): void {
    const currentUser: CurrentUser = {
      userId: loginResponse.userId,
      fullName: loginResponse.fullName,
      username: loginResponse.username,
      role: loginResponse.role,
    };

    localStorage.setItem(this.tokenStorageKey, loginResponse.token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(currentUser));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  getCurrentUser(): CurrentUser | null {
    const storedUser = localStorage.getItem(this.userStorageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as CurrentUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
  }
}
