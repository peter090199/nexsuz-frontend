import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { _url } from 'src/global-variables';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || ''; // Fetch the token from localStorage or other storage
  }

  // ---- CHECK LOGIN STATUS ----
  isLoggedIn(): boolean {
    const token = this.getAuthToken();
    return !!token; // true if a token exists in sessionStorage, false otherwise
  }

  getAuthCode(): string {
    return sessionStorage.getItem('code') || '';
  }


  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private createParams(): HttpParams {
    return new HttpParams().set('desc_code', 'top_navigation');
  }



  getData(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}user`, { headers });
  }

  getProfilecode(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}user/profile`, { headers });
  }

  requestCode(phone: string): Observable<any> {
    return this.http.post(`${_url}password/request-code`, { phone });
  }

  // auth.service.ts
  sendCode(phone: string) {
    return this.http.post(`${_url}phone/send-code`, { phone });
  }

  verifyCode(phone: string, code: string) {
    return this.http.post(`${_url}phone/verify-code`, { phone, code });
  }


  resetPassword(phone: string, resetToken: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${_url}password/reset`, { phone, reset_token: resetToken, password, password_confirmation });
  }


  private handleAuthError(error: any): Observable<any> {
    if (error.status === 401) {
      console.error('Unauthorized: Please log in.');
      alert('Unauthorized access. Please log in again.');
    } else if (error.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource.');
      alert('Forbidden: You do not have the required permissions.');
    } else {
      console.error('An error occurred:', error.message);
      alert('An unexpected error occurred. Please try again.');
    }
    return of(null); // Return an observable with a fallback value
  }

}
