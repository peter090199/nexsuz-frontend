import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { _url } from 'src/global-variables';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || '';
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });
  }

  subscribe(userId: number, planId: number) {
    return this.http.post(`${_url}subscribe`, {
      user_id: userId,
      plan_id: planId
    }, { headers: this.createHeaders() });
  }


  myFeatures(): Observable<any> {
    return this.http.get(
      `${_url}account-plan-details/my-plan-features`,
      { headers: this.createHeaders() }
    );
  }

  
}