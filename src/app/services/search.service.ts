import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { _url } from 'src/global-variables';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private socket$: WebSocketSubject<any>;

  constructor(private http: HttpClient) {
    this.socket$ = webSocket('wss://ws-ap1.pusher.com/app/e0cd7653f3ae9bbbd459?protocol=7&client=js&version=8.4.0&flash=false');
  }
  private storageKey = 'loggedInUser';
  private user = { code: 702, fullname: "Pedro Yorpo" }; // Example


  private getAuthToken(): string {
    return sessionStorage.getItem('token') || ''; // Fetch the token from localStorage or other storage
  }

  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private createParams(): HttpParams {
    return new HttpParams().set('search', '');
  }


  setLoggedInUser(user: any) {
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      console.log('User saved:', user);
    } else {
      console.error('Invalid user data.');
    }
  }

  getLoggedInUser(): any {
    const user = localStorage.getItem(this.storageKey);
    return user ? JSON.parse(user) : null;
  }



  getSecurityRoles(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}security`, { headers }).pipe(
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



  getSearch(searchQuery: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`, // Attach token dynamically
      'Content-Type': 'application/json'
    });

    const url = `${_url}searchUsers?search=${encodeURIComponent(searchQuery)}`;
    return this.http.get<any>(url, { headers });
  }

  searchUsers(query: string = ''): Observable<{ online: any[]; offline: any[] }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`, // Attach token dynamically
      'Content-Type': 'application/json'
    });

    return this.http.get<{ online: any[]; offline: any[] }>(
      `${_url}searchUsers?search=${query}`,
      { headers } // Pass headers here
    );
  }
  searchUsersBypublic(query: string = ''): Observable<{ online: any[]; offline: any[] }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<{ online: any[]; offline: any[] }>(
      `${_url}searchUsersBypublic?search=${query}`,
      { headers }
    );
  }

  receiveMessages(): Observable<any> {
    return this.socket$;
  }

}

