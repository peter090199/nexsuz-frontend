import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { _url } from 'src/global-variables';


@Injectable({
  providedIn: 'root'
})
export class JobListService {

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


  getActiveJobs(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getActiveJobs`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  getActiveJobsByPublic(page: number = 1) {
    return this.http.get<any>(`${_url}getActiveJobsByPublic?page=${page}`);
  }

  getActiveJobsByCode(code: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getActiveJobsByCode/${code}`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }
  getJobVacanciesByCode(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getJobVacanciesCountByCode`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }
  getAppliedJobCount(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getAppliedJobCount`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }
  getPendingReviews(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getPendingReviews`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  getHired(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getHired`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }
  deleteJobPosting(id: number): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete<any>(`${_url}deleteJobPosting/${id}`, { headers });
  }

  getAppliedStatus(transNo: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get<any>(`${_url}getAppliedJobByUsers/${transNo}`, { headers });
  }


}
