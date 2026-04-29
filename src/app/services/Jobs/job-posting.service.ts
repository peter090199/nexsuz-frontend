import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { _url } from 'src/global-variables';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';


@Injectable({
  providedIn: 'root'
})
export class JobPostingService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || ''; // Fetch the token from localStorage or other storage
  }


  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      //'Content-Type': 'application/json'
    });
  }

  private createParams(): HttpParams {
    return new HttpParams().set('desc_code', 'top_navigation');
  }

  getProfileByUser(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}profile`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
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


  saveJobPosting(payload: FormData): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post<any>(`${_url}job-posting`, payload, { headers });
  }

  updateJobPosting(payload: FormData, transNo: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post<any>(
      `${_url}job-posting/${transNo}?_method=PUT`,
      payload, { headers }
    );
  }

  getJobPosting(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getJobPostingsByCode`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  deleteJobPosting(transNo: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete<any>(`${_url}deleteJobPosting/${transNo}`, { headers });
  }




}
